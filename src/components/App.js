// @flow

import React from 'react'
import _ from 'lodash'
import { Map, Set, Seq, Record } from 'immutable'
import type { RecordFactory, RecordOf } from 'immutable';

import CounterDisplayer from './Counter'
import Selections from './Selections'
import DisplayTable from './DisplayTable'
import UserActions from './UserActions'
import ErrorPrompt from './ErrorPrompt'
// Class
import { DataDict, iterateDict} from 'class/DataDict'
import type { FileJSONObj, DataDictObj, FileContent, DF } from 'class/DataDict'
import { FilterState } from 'class/FilterState'
import type { FilterStateType } from 'class/FilterState'
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
	dataDict: {obj: DataDictObj};
	handleSelect: ({ [string]: number | string }) => void;
	handleCheck: ( SyntheticInputEvent<HTMLInputElement> ) => void;
	handleCheckAll: ( SyntheticInputEvent<HTMLInputElement> ) => void;


	constructor() {
		super()


		this.handleSelect = this.handleSelect.bind(this)
		this.handleCheck = this.handleCheck.bind(this)
		this.handleCheckAll = this.handleCheckAll.bind(this)

		let DATA: Data = initDATA()

		let deleteListObject = initDeleteList(DATA, DELETELIST)

		// dataDictObj holder
		this.dataDict = new DataDict({})

		try {
			this.dataDict.buildFromObjectArr(DATA.ROWSET.ROW)
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
		iterateDict(this.dataDict.obj, (fileObj) => {
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
			filterState: new FilterState(),
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
	handleSelect(obj: {[string]: number | string}) {

		let newFilterState = this.state.filterState.setState(obj)

		// show selected things
		let filterResult = filterDataDict(this.dataDict.obj, newFilterState.toArray(4))

		const keysToUpdateSet = Set(filterResult.array)

		const newTrInfosMap = this.state.trInfos.map((trInfo, key) => {
			let newTrInfo
			if(keysToUpdateSet.has(key)) {
				newTrInfo = trInfo.set('toShow', true)
			} else {
				newTrInfo = trInfo.set('toShow', false)
			}
			return newTrInfo
		})

		this.setState({trInfos: newTrInfosMap})




		this.setState(state => {
			state.counter.display = filterResult.array.length
			state.counter.mergeDisplay = filterResult.mergeCount
			return state
		})

		this.setState({
				filterState: newFilterState
			})

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
			{/*
			<ErrorPrompt errors={PARSEERROR}/>
			<CounterDisplayer counter={this.state.counter} fileName={FILENAME} trInfos={this.state.trInfos}/>
			<UserActions trInfos={this.state.trInfos} />
		*/}
		<section className="contents">
			<table className="table" id="displayTable">
			<Selections filterState={this.state.filterState} dataDictObj={this.dataDict.obj} onSelect={this.handleSelect} onCheckAll={this.handleCheckAll}/>
			<DisplayTable dataDictObj={this.dataDict.obj} trInfos={this.state.trInfos} onCheck={this.handleCheck}/>
			</table>
		</section>
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





function filterDataDict_ (obj: DataDictObj, stateArr: Array<string>, resultArr: Array<string>, mergeCount: number) {
	if(stateArr.length === 0) {
		iterateDict(obj, (obj) => {
			resultArr.push(obj["@num"])
			if(obj.isMerge) {
				mergeCount++
			}
		})
	} else {
		if(stateArr[0] === "不篩選") {
			_.forOwn(obj, (value, key) => {
					if(key !== "sort" && value.sort === "DataDictObj") {
						let filterResult = filterDataDict_(value, stateArr.slice(1, stateArr.length), [], mergeCount)
						resultArr = resultArr.concat(filterResult.array)
						mergeCount = filterResult.mergeCount
					} else if (value.sort === "FileContent") {
						console.error("programming error")
					}
			})
		} else {
			if(obj[stateArr[0]]) {
				if(obj[stateArr[0]].sort === "DataDictObj") {
					let filterResult = filterDataDict_(obj[stateArr[0]], stateArr.slice(1, stateArr.length), [], mergeCount)
					resultArr = resultArr.concat(filterResult.array)
					mergeCount = filterResult.mergeCount
					} else {
						console.error("Type Error: Programming Error")
					}
				}
		}
	}
	return {array: resultArr, mergeCount: mergeCount}
}

function filterDataDict(dataDictObj: DataDictObj, stateArr: Array<string>): {array: Array<string>, mergeCount: number} {
	return filterDataDict_(dataDictObj, stateArr, [], 0)
}



export default App