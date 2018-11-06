import React from 'react'
import { iterateDict } from 'class/DataDict'
import _ from 'lodash'

class DisplayTable extends React.Component{
	constructor(props) {
		super(props)

		this.trInfos = []
		iterateDict(props.dataDictObj, obj => obj["@num"], (fileObj, pathRecord) => {
			let trInfo = {
				fileObj: fileObj,
				pathRecord: pathRecord,
			}
			this.trInfos.push(trInfo)
		})
	}

	// static getDerivedStateFromProps(props, state) {
	// 	let newState = {}
	// 	iterateDict(props.dataDictObj, obj => obj["@num"], (fileObj) => {
	// 		_.set(newState, `${fileObj["@num"]}.toShow`, fileObj.toShow)
	// 		_.set(newState, `${fileObj["@num"]}.checked`, props.deleteListObj[fileObj["@num"]])
	// 	})
	// 	return {trs: newState}
	// }

	render() {
		return (
			<tbody>{
				this.trInfos.map(trInfo =>{
					let num = trInfo.fileObj["@num"]
					return <MyTr
						key={num}
						fileObj={trInfo.fileObj}
						pathRecord={trInfo.pathRecord}
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