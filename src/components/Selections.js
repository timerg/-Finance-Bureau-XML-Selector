

import React from 'react'


const Selections = ({ filterState, dataDictObj, onSelect, onSelectAll }) => {
	let stateArr = filterState.toArray(4)
	let selectionsSetArr = getSelectSetArrFromDict(stateArr, dataDictObj)
	return <thead>
          <tr>
            <th style={{"width": "5%"}}>
              刪除
			  <input type="checkBox" id="select-all" onChange={onSelectAll}/>
            </th>
            <th className="selection" style={{"width": "13%"}}>
              年度
              <select name="年度號" onChange={(event) => {
				  onSelect({"年度號": event.target.value})
			  }} value={filterState["年度號"]}>
				{convertSetToOptions(selectionsSetArr[0])}
              </select>
            </th>
            <th className="selection" style={{"width": "13%"}}>
              分類號
              <select name="分類號" onChange={(event) => {
				  onSelect({"分類號": event.target.value})
			  }} value={filterState["分類號"]}>
				{convertSetToOptions(selectionsSetArr[1])}
              </select>
            </th>
            <th className="selection" style={{"width": "13%"}}>案次號
              <select name="案次號" onChange={(event) => {
				  onSelect({"案次號": event.target.value})
			  }} value={filterState["案次號"]}>
				{convertSetToOptions(selectionsSetArr[2])}
              </select>
            </th>
            <th className="selection" style={{"width": "13%"}}>卷次號
              <select name="卷次號" onChange={(event) => {
				  onSelect({"卷次號": event.target.value})
			  }} value={filterState["卷次號"]}>
				{convertSetToOptions(selectionsSetArr[3])}
              </select>
            </th>
            <th style={{"width": "13%"}}>目次號</th>
			<th style={{"width": "30%"}} >案由</th>
          </tr>
        </thead>
}

function getSelectSetArrFromDict_(stateArr, dataDictObj, selectionsSetArr, level) {
	if(dataDictObj && level < 4) {
		Object.keys(dataDictObj).map(o => {
			if(o !== "sort") {
				selectionsSetArr[level].add(o)
			}
		})

		if(stateArr[level] === "不篩選") {
			Object.keys(dataDictObj).map(k => {
				if(k !== "sort") {
					selectionsSetArr = getSelectSetArrFromDict_(stateArr, dataDictObj[k], selectionsSetArr, level + 1)
				}
			})
		} else {
			selectionsSetArr = getSelectSetArrFromDict_(stateArr, dataDictObj[stateArr[level]], selectionsSetArr, level + 1)
		}
	}
	return selectionsSetArr
}

function getSelectSetArrFromDict(stateArr, dataDictObj) {
	let selectionsSetArr = [new Set(["不篩選"]), new Set(["不篩選"]), new Set(["不篩選"]), new Set(["不篩選"])]
	return getSelectSetArrFromDict_(stateArr, dataDictObj, selectionsSetArr, 0)
}

function convertSetToOptions(set, thisState) {
	let options = []
	let keyCount = 0
	for (let v of set) {
		let option = <option key={keyCount} value={v}>{v}</option>
		options.push(option)
		keyCount++
	}
	return options
}


export default Selections