import React from 'react'


const CounterDisplayer = ({fileName, counter, trInfos}) => {
	let checkedCounterAll = 0
	let checkedCounterDisplayed = 0
	Object.keys(trInfos).map((key) => {
		if(trInfos[key].checked) {
			checkedCounterAll++
			if(trInfos[key].toShow) {
				checkedCounterDisplayed++
			}
		}
	})
	return (
		<div className='counter'>
			<span id='file-name'> {fileName} </span>
			<span>&nbsp;&nbsp;</span>
			<span id='row-counter'> 共 {counter.display} / {counter.all} </span>
			件，含併案
			<span id='merge-file-counter'> {counter.mergeDisplay} / {counter.mergeAll} </span>
			件 ，已勾選
			<span id='check-counter'> {checkedCounterDisplayed} / {checkedCounterAll} </span>
			件
		</div>
	)
}

function countDeleteList(deleteList) {
	let counter = 0
	Object.keys(deleteList).map(k => {
		if(deleteList[k] == true) {
			counter++
		}
	})
	return counter
}

export default CounterDisplayer