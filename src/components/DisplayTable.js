// @flow
import React from 'react'
import { iterateDict } from '../class/DataDict'
import type { DataDictObj, FileContent, PathRecord } from '../class/DataDict'
import _ from 'lodash'

type Props = {
	dataDictObj: DataDictObj,
	trInfos: TrInfos,
	onCheck: () => void
}

type TrInfos = {
	[number]: {
		toShow: Boolean,
		checked: Boolean
	}
}

type TrInfoItem = {
	fileObj: FileContent,
	pathRecord: PathRecord
}


class DisplayTable extends React.Component <Props>{
	trInfosArray: Array<TrInfoItem>
	constructor(props: Props) {
		super(props)

		this.trInfosArray = []
		iterateDict(props.dataDictObj, (fileObj, pathRecord) => {
			let trInfoItem: TrInfoItem = {
				fileObj: fileObj,
				pathRecord: pathRecord,
			}
			this.trInfosArray.push(trInfoItem)
		})
	}

	// static getDerivedStateFromProps(props, state) {
	// 	let newState = {}
	// 	iterateDict(props.dataDictObj, (fileObj) => {
	// 		_.set(newState, `${fileObj["@num"]}.toShow`, fileObj.toShow)
	// 		_.set(newState, `${fileObj["@num"]}.checked`, props.deleteListObj[fileObj["@num"]])
	// 	})
	// 	return {trs: newState}
	// }

	render() {
		return (
			<tbody>{
				this.trInfosArray.map(trInfoItem =>{
					let num = trInfoItem.fileObj["@num"]
					return <MyTr
						key={num}
						fileObj={trInfoItem.fileObj}
						pathRecord={trInfoItem.pathRecord}
						toShow={this.props.trInfos[num].toShow}
						checked={this.props.trInfos[num].checked}
						func={this.props.onCheck}
					/>
				})
			}
			</tbody>
		)
	}
}

const MyTr = ({fileObj, pathRecord, func, toShow, checked}) => {
	return <tr
		className={`${(fileObj.isMerge) ? 'mergeFile' : ''} ${(toShow) ? '' : 'myHiddenTr'}`}
		>
		<td> <input className='deleteCheck' checked={checked} name="toDelete" type="checkBox" value={fileObj["@num"]} onChange={func} /></td>
		<td>{pathRecord[0]}</td>
		<td>{pathRecord[1]}</td>
		<td>{pathRecord[2]}</td>
		<td>{pathRecord[3]}</td>
		<td>{pathRecord[4]}</td>
		<td>{fileObj["案由"]}</td>
	</tr>
}










export default DisplayTable