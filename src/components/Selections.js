// @flow

import React from 'react'

import { Map, Set } from 'immutable'
import _ from 'lodash'
// import { } from 'class/FilterState'
import type { StatesType } from 'class/FilterState'

import type { DataDictObj } from 'class/DataDict'



type Props = {
	filterState: StatesType,
	dataDictObj: DataDictObj,
	onCheckAll: ( SyntheticInputEvent<HTMLInputElement> ) => void,
	onSelect: (key: string, value: string) => void,
}




const Selections = (props:Props) => {
	return
}




// const Selections = ({ filterState, dataDictObj, onSelect, onCheckAll }: SelectionsProps) => {
//
// 	let selectionsSetArr = getSelectSetArrFromDict(stateArr, dataDictObj)
// 	return <thead>
//           <tr>
//             <th style={{"width": "5%"}}>
//               刪除
// 			  <input type="checkBox" id="select-all" onChange={onCheckAll}/>
//             </th>
//             <th className="selection" style={{"width": "13%"}}>
//               年度
//               <select name="年度號" onChange={(event) => {
// 				  onSelect({"年度號": event.target.value})
// 			  }} value={filterState["年度號"]}>
// 				{convertSetToOptions(selectionsSetArr[0])}
//               </select>
//             </th>
//             <th className="selection" style={{"width": "13%"}}>
//               分類號
//               <select name="分類號" onChange={(event) => {
// 				  onSelect({"分類號": event.target.value})
// 			  }} value={filterState["分類號"]}>
// 				{convertSetToOptions(selectionsSetArr[1])}
//               </select>
//             </th>
//             <th className="selection" style={{"width": "13%"}}>案次號
//               <select name="案次號" onChange={(event) => {
// 				  onSelect({"案次號": event.target.value})
// 			  }} value={filterState["案次號"]}>
// 				{convertSetToOptions(selectionsSetArr[2])}
//               </select>
//             </th>
//             <th className="selection" style={{"width": "13%"}}>卷次號
//               <select name="卷次號" onChange={(event) => {
// 				  onSelect({"卷次號": event.target.value})
// 			  }} value={filterState["卷次號"]}>
// 				{convertSetToOptions(selectionsSetArr[3])}
//               </select>
//             </th>
//             <th style={{"width": "13%"}}>目次號</th>
// 			<th style={{"width": "30%"}} >案由</th>
//           </tr>
//         </thead>
// }
//
// type SelectionTrProps = {
// 	name: string,
// 	set: Set<string>,
// 	state: string,
// 	onSelect: ({ [string]: number | string }) => void,
// }
//
// const selectionTh = ({ name, state, set, onSelect }: SelectionTrProps) => {
// 	<th className="selection" style={{"width": "13%"}}>{name}
// 	  <select name={name} onChange={(event) => {
// 		  onSelect(_.set({}, [name, event.target.value]))
// 	  }} value={state}>
// 		{convertSetToOptions(set)}
// 	  </select>
// 	</th>
// }
//
//
//
//
//
// function convertSetToOptions(set) {
// 	let options = []
// 	let keyCount = 0
// 	for (let v of set) {
// 		let option = <option key={keyCount} value={v}>{v}</option>
// 		options.push(option)
// 		keyCount++
// 	}
// 	return options
// }
//




export default Selections