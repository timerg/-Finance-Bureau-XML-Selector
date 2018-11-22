// @flow

import React from 'react'

import { Map, Set } from 'immutable'
import _ from 'lodash'
import { setState as setFilterState} from 'class/FilterState'
import type { StatesType as FilterStateType, StateType as SubFilterStateType } from 'class/FilterState'

import type { DataDictMap } from 'class/DataDict'



type SelectionsProps = {
	filterState: FilterStateType,
	dataDictMap: DataDictMap,
	onCheckAll: ( SyntheticInputEvent<HTMLInputElement> ) => void,
	onSelect: (keyVal: string, nextState: string) => void,
}




// const Selections = (props:Props) => {
// 	return
// }




const Selections = ({ filterState, dataDictMap, onSelect, onCheckAll }: SelectionsProps) => {
	return <thead>
          <tr>
            <th style={{"width": "5%"}}>
              全選
			  			<input type="checkBox" id="select-all" onChange={onCheckAll}/>
            </th>
						<SelectionTh name="年度號" keyVal='year' state={filterState.get('year')} onSelect={onSelect}/>
						<SelectionTh name="分類號" keyVal='kind' state={filterState.get('kind')} onSelect={onSelect}/>
						<SelectionTh name="案次號" keyVal='cas_' state={filterState.get('cas_')} onSelect={onSelect}/>
						<SelectionTh name="卷次號" keyVal='volm' state={filterState.get('volm')} onSelect={onSelect}/>
            <th style={{"width": "13key=''%"}}>目次號</th>
						<th style={{"width": "30%"}} >案由</th>
          </tr>
        </thead>
}

type SelectionTrProps = {
	name: string,
	keyVal: string,
	state: SubFilterStateType,
	onSelect: (keyVal: string, nextState: string) => void,
}

const SelectionTh = ({ name, keyVal, state, onSelect }: SelectionTrProps) => {
	const set = state.get('keySet')
	const nextState = state.get('currentState')
	return <th className="selection" style={{"width": "13%"}}>{name}
	  <select name={keyVal} onChange={(e) => {onSelect(e.target.name, e.target.value)}} value={nextState}>
			<option key={0} value="不篩選">不篩選</option>
			{convertSetToOptions(set)}
	  </select>
	</th>
}





function convertSetToOptions(set: KeySet) {
	let options = []
	let keyCount = 1
	for (let v of set) {
		let option = <option key={keyCount} value={v}>{v}</option>
		options.push(option)
		keyCount++
	}
	return options
}





export default Selections