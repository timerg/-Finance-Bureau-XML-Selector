// @flow

import React from 'react'
import _ from 'lodash'
import { Map, Set, Seq, Record, List } from 'immutable'
import type { RecordFactory, RecordOf } from 'immutable';

import CounterDisplayer from './Counter'
import Selections from './Selections'
import DisplayTable from './DisplayTable'
import UserActions from './UserActions'
import ErrorPrompt from './ErrorPrompt'
// Class
import { CreateDataDictMap, iterateMap} from 'class/DataDict'
import type { FileJSONObj, FileContent, DF, DataDictMap } from 'class/DataDict'
import { initStatesFromDataDict as initFilterStatesFromDataDict, setState as setFilterState } from 'class/FilterState'
import type { StatesType as FilterStateType } from 'class/FilterState'
// import './lib/api.js'

type Data = {
	ROWSET: {
		ROW: Array<FileJSONObj>
	}
}

export type TrInfos = {
	[string]: TrInfo
}

type TrInfoProps = {
	toShow: boolean,
	checked: boolean
}

export type TrInfo = RecordOf<TrInfoProps>;

const TrInfoRecord = Record({
	toShow: true,
	checked: false
})

type Props = 	{}
type State = {
	filterState: FilterStateType,
	trInfos: Map<string, TrInfo>,
	counter: {
		all: number,
		mergeAll: number,
		display: number,
		mergeDisplay: number,
	}
}

class App extends React.Component <Props, State>{
	dataDict: DataDictMap;
	handleSelect: (key:string, nextState:string) => void;
	handleCheck: ( SyntheticInputEvent<HTMLInputElement> ) => void;
	handleCheckAll: ( SyntheticInputEvent<HTMLInputElement> ) => void;


	constructor() {
		super()

		this.handleSelect = this.handleSelect.bind(this)
		this.handleCheck = this.handleCheck.bind(this)
		this.handleCheckAll = this.handleCheckAll.bind(this)

		let DATA: Data = initDATA()

		let deleteListObject = initDeleteList(DATA, DELETELIST)



		try {
			this.dataDict = CreateDataDictMap(DATA.ROWSET.ROW)
		} catch (e) {
			let eFile = DATA.ROWSET.ROW[DATA.ROWSET.ROW.length - 1]
			alert(
				'檔案格式有錯誤, 請檢查  <ROW num="' + eFile['@num'] + '">' + "'"
				+ eFile["案由"]["$"] + " ' 後的字"
				)
			console.error(e)
		}

		let trInfos: TrInfos = {}
		let mergeCount = 0
		iterateMap(this.dataDict, (fileObj) => {
			if(trInfos[fileObj["@num"]]) {
				console.error("Repeated num") // this shouldn't be called since server has survayed and fixed the num
			}
			trInfos[fileObj["@num"]] = TrInfoRecord({
				// toShow: true,
				checked: deleteListObject[fileObj["@num"]]
			})
			if(fileObj.isMerge) {
				mergeCount++
			}
		})

		this.state = {
			filterState: initFilterStatesFromDataDict(this.dataDict),
			trInfos: Map(trInfos),
			counter: {
				all: DATA.ROWSET.ROW.length,
				mergeAll: mergeCount,
				display: DATA.ROWSET.ROW.length,
				mergeDisplay: mergeCount,
			}
		}
	}

	// when selection change, update filterState
	handleSelect(key:string, nextState:string) {
		const newFilterState = setFilterState(key, nextState, this.state.filterState)
		const newTrInfos = getTrInfosFromFilterState(newFilterState.get('file').get('listOfMaps'), this.state.trInfos, this.dataDict)

		this.setState({filterState: newFilterState, trInfos: newTrInfos})
	}


	// when a tr is checked, update deleteListObject
	handleCheck(event: SyntheticInputEvent<HTMLInputElement>) {
		const trInfos = this.state.trInfos.update(event.target.value, trInfo => trInfo.set('checked', event.target.checked))
		this.setState({trInfos})
	}

	handleCheckAll(event: SyntheticInputEvent<HTMLInputElement>) {
		const trInfos = this.state.trInfos.map((trInfo, key) => {
			let newTrInfo = trInfo
			if(trInfo.get('toShow') === true) {
				newTrInfo = trInfo.set('checked', event.target.checked)
				if(!newTrInfo) {
					console.error("programming error")
				}
			}
			return newTrInfo
		})
		this.setState({trInfos})
	}

	render() {
		return(<>
			<ErrorPrompt errors={PARSEERROR}/>
			<CounterDisplayer counter={this.state.counter} fileName={FILENAME} trInfos={this.state.trInfos}/>
			<section className="contents">
				<table className="table" id="displayTable">
				<Selections filterState={this.state.filterState} dataDictMap={this.dataDict} onSelect={this.handleSelect} onCheckAll={this.handleCheckAll}/>
				<DisplayTable dataDictObj={this.dataDict} trInfos={this.state.trInfos} onCheck={this.handleCheck}/>
				</table>
			</section>
			<UserActions trInfos={this.state.trInfos} />
		</>)
	}
}




function initDATA(): Data {
	var DATA = FILEJSON;
	// handle anther FILE type (案卷層級)
	if(!DATA.ROWSET.ROW && DATA.ROWSET["案件"]) {
		DATA.ROWSET.ROW = DATA.ROWSET["案件"]
		delete DATA.ROWSET["案件"]
	}
	// single row file uses object instead of array to contain the row
	if(!DATA.ROWSET.ROW.length) {
		DATA.ROWSET.ROW = [DATA.ROWSET.ROW]
	}
	return DATA
}

function initDeleteList(DATA, deleteList=null): { [string]:boolean } {
	var deleteListObject = {}
	//  initial deleteList
	if(deleteList) {
		// JSON.parse(deleteList).map(obj => {
		deleteList.map(obj => {
			deleteListObject[obj.num] = obj.toDelete
		})

	} else {
		DATA.ROWSET.ROW.map(r => {
			deleteListObject[r["@num"]] = false
		})
	}
	return deleteListObject
}


function getTrInfosFromFilterState(fileFilterState: List<DataDictMap>, trInfos: Map<string, TrInfo>, dataDictMap: DataDictMap): Map<string, TrInfo> {
	let displayedSet: Set<string> = Set([])
	let newTrInfos = trInfos
	// O(logn)*n
	for(let map of fileFilterState) {
		iterateMap(map, (fileObj, pathRecord) => {
			displayedSet = displayedSet.add(fileObj['@num'])
		})
	}

	// (O(logn) + O(logn))*n
	iterateMap(dataDictMap, (fileObj) => {
		let displayed = false
		if(displayedSet.has(fileObj['@num'])) {
			displayed = true
		}
		newTrInfos = newTrInfos.update(fileObj['@num'], (trInfo): TrInfo => trInfo.set('toShow', displayed))
	})

	return newTrInfos
}




export default App