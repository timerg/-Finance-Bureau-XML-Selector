// @flow

import React from 'react'
import { Map, List, Set } from 'immutable'

import Selections from './Selections'
import DisplayTable from './DisplayTable'
import type { StatesType as FilterStateType } from 'class/FilterState'
import { setState as setFilterState } from 'class/FilterState'
import { iterateMap } from 'class/DataDict'
import type { DataDictMap } from 'class/DataDict'
import type { TrInfo } from './App'

type Props = {
  filterState: FilterStateType,
  dataDictMap: DataDictMap,
  trInfos: Map<string, TrInfo> ,
  updateState: ( newState: {}) => void
}


class TableSection extends React.Component <Props>  {
  handleSelect: (key:string, nextState:string) => void;
  handleCheck: ( SyntheticInputEvent<HTMLInputElement> ) => void;
  handleCheckAll: ( SyntheticInputEvent<HTMLInputElement> ) => void;



  constructor() {
    super()
    this.handleSelect = this.handleSelect.bind(this)
    this.handleCheck = this.handleCheck.bind(this)
    this.handleCheckAll = this.handleCheckAll.bind(this)
  }

  // when selection change, update filterState
  handleSelect(key:string, nextState:string) {
    const newFilterState = setFilterState(key, nextState, this.props.filterState)
    const newTrInfos = getTrInfosFromFilterState(newFilterState.get('file').get('listOfMaps'), this.props.trInfos, this.props.dataDictMap)

    // this.setState({filterState: newFilterState, trInfos: newTrInfos})
    this.props.updateState({filterState: newFilterState, trInfos: newTrInfos})
  }


  // when a tr is checked, update deleteListObject
  handleCheck(event: SyntheticInputEvent<HTMLInputElement>) {
    const trInfos = this.props.trInfos.update(event.target.value, trInfo => trInfo.set('checked', event.target.checked))
    // this.setState({trInfos})
    this.props.updateState({trInfos: trInfos})
  }

  handleCheckAll(event: SyntheticInputEvent<HTMLInputElement>) {
    const trInfos = this.props.trInfos.map((trInfo, key) => {
      let newTrInfo = trInfo
      if(trInfo.get('toShow') === true) {
        newTrInfo = trInfo.set('checked', event.target.checked)
        if(!newTrInfo) {
          console.error("programming error")
        }
      }
      return newTrInfo
      })
      // this.setState({trInfos})
      this.props.updateState({trInfos: trInfos})
    }


  render() {
    return (
      <section className="contents">
        <table className="table" id="displayTable">
        <Selections filterState={this.props.filterState} dataDictMap={this.props.dataDictMap} onSelect={this.handleSelect} onCheckAll={this.handleCheckAll}/>
        <DisplayTable dataDictObj={this.props.dataDictMap} trInfos={this.props.trInfos} onCheck={this.handleCheck}/>
        </table>
      </section>
    )
  }
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


export default TableSection