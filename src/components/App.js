// @flow

import React from 'react'
import _ from 'lodash'
import { Map, Set, Seq, Record, List } from 'immutable'
import type { RecordFactory, RecordOf } from 'immutable';

import CounterDisplayer from './Counter'
import UserActions from './UserActions'
import ErrorPrompt from './ErrorPrompt'
import Section from './TableSection'
// Class
import { CreateDataDictMap, iterateMap} from 'class/DataDict'
import type { FileJSONObj, FileContent, DF, DataDictMap } from 'class/DataDict'
import { initStatesFromDataDict as initFilterStatesFromDataDict } from 'class/FilterState'
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
	handleUpdateState: ( newState: {}) => void;


	constructor() {
		super()
		this.handleUpdateState = this.handleUpdateState.bind(this)

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



	handleUpdateState(newState: {}): void {
		this.setState(newState)
	}

	render() {
		return(<>
			<ErrorPrompt errors={PARSEERROR}/>
			<CounterDisplayer counter={this.state.counter} fileName={FILENAME} trInfos={this.state.trInfos}/>
			<Section filterState={this.state.filterState} dataDictMap={this.dataDict} trInfos={this.state.trInfos} updateState={this.handleUpdateState}/>
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







export default App