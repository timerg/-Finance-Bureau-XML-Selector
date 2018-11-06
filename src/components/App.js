import React from 'react'
import _ from 'lodash'

import CounterDisplayer from './Counter'
import Selections from './Selections'
import DisplayTable from './DisplayTable'
import UserActions from './UserActions'
import ErrorPrompt from './ErrorPrompt'
// Class
import { DataDict, iterateDict} from 'class/DataDict'
import FilterState from 'class/FilterState'
// import './lib/api.js'

class App extends React.Component {
	constructor() {
		super()


		this.handleSelect = this.handleSelect.bind(this)
		this.handleCheck = this.handleCheck.bind(this)
		this.handleSelectAll = this.handleSelectAll.bind(this)

		let DATA = initDATA()

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
			console.log(DATA.ROWSET.ROW)
		}

		let trInfos = {}
		let mergeCount = 0
		iterateDict(this.dataDict.obj, obj => obj["@num"], (fileObj) => {
			if(trInfos[fileObj["@num"]]) {
				console.error("Repeated num") // this shouldn't be called since server has survayed and fixed the num
			}
			trInfos[fileObj["@num"]] = {
				toShow: true,
				checked: deleteListObject[fileObj["@num"]]
			}
			if(fileObj.isMerge) {
				mergeCount++
			}
		})

		this.state = {
			filterState: new FilterState(),
			trInfos: trInfos,
			counter: {
				all: DATA.ROWSET.ROW.length,
				mergeAll: mergeCount,
				display: DATA.ROWSET.ROW.length,
				mergeDisplay: mergeCount,
			}
		}


		// free memory
		DATA = null

	}

	// when selection change, update filterState
	handleSelect(obj) {

		let newFilterState = this.state.filterState.setState(obj)

		// hide everything
		let newTrInfos = _.mapValues(this.state.trInfos, obj => ({ ...obj, toShow: false }));
		this.setState({ trInfos: newTrInfos });

		// show selected things
		let filterResult = filterDataDict(this.dataDict.obj, newFilterState.toArray(4), () => {mergeCount++} )
		filterResult.array.map(key => {
			this.setState(state => {
				state.trInfos[key].toShow = true
				return state
			});
		})

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
	handleCheck(event) {
		let t = event.target
		let newTrInfosState = {}
		_.setWith(newTrInfosState, `${t.value}.checked`, event.target.checked, Object)
		let trInfos = this.state.trInfos
		_.merge(trInfos, newTrInfosState)
		this.setState({trInfos: trInfos})
	}

	handleSelectAll(event) {
		let checked = event.target.checked
		let newTrInfosState = {}
		Object.keys(this.state.trInfos).map(key => {
			if(this.state.trInfos[key].toShow) {
				newTrInfosState[key] = {toShow: true, checked: checked}
			}
		})
		this.setState({trInfos: newTrInfosState})
	}

	render() {
		return(<>
			<ErrorPrompt errors={PARSEERROR}/>
			<CounterDisplayer counter={this.state.counter} fileName={FILENAME} trInfos={this.state.trInfos}/>
			<section className="contents">
				<table className="table" id="displayTable">
					<Selections filterState={this.state.filterState} dataDictObj={this.dataDict.obj} onSelect={this.handleSelect} onSelectAll={this.handleSelectAll}/>
					<DisplayTable dataDictObj={this.dataDict.obj} trInfos={this.state.trInfos} onCheck={this.handleCheck}/>
				</table>
			</section>
			<UserActions trInfos={this.state.trInfos} />
		</>)
	}
}




function initDATA() {
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

function initDeleteList(DATA, deleteList=null) {
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



function filterDataDict_(obj, stateArr, resultArr, mergeCount) {
	if(stateArr.length === 0) {
		Object.keys(obj).map(key => {
			// 主併文
			if(!obj[key]["@num"]) {
				Object.keys(obj[key]).map(key2 => {
					resultArr.push(obj[key][key2]["@num"])
					if(obj[key][key2].isMerge) {
						mergeCount++
					}

				})
			} else {
				resultArr.push(obj[key]["@num"])
				if(obj[key].isMerge) {
					mergeCount++
				}
			}
		})
	} else {
		if(stateArr[0] === "不篩選") {
			Object.keys(obj).map(key => {
				let filterResult = filterDataDict_(obj[key], stateArr.slice(1, stateArr.length), [], mergeCount)
				resultArr = resultArr.concat(filterResult.array)
				mergeCount = filterResult.mergeCount
			})
		} else {
			if(obj[stateArr[0]]) {
				let filterResult = filterDataDict_(obj[stateArr[0]], stateArr.slice(1, stateArr.length), [], mergeCount)
				resultArr = resultArr.concat(filterResult.array)
				mergeCount = filterResult.mergeCount

			}
		}
	}
	return {array: resultArr, mergeCount: mergeCount}
}


function filterDataDict(dataDictObj, stateArr) {
	return filterDataDict_(dataDictObj, stateArr, [], 0)
}



export default App