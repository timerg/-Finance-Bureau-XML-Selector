// @flow
import React from 'react'
import { iterateDict } from '../class/DataDict'
import type { DataDictObj, FileContent, PathRecord } from '../class/DataDict'
import _ from 'lodash'
import { Map } from 'immutable'

import type { TrInfo } from 'components/App'

type Props = {
	dataDictObj: DataDictObj,
	trInfos: Map<string, TrInfo>,
	onCheck: (SyntheticInputEvent<HTMLInputElement>) => void
}



type TrInfoItem = {
	fileObj: FileContent,
	pathRecord: PathRecord
}


class DisplayTable extends React.Component <Props>{
	trInfosArray: Array<TrInfoItem>
	constructor(props: Props) {
		super(props)

		// save all files info to a row of
		this.trInfosArray = []
		iterateDict(props.dataDictObj, (fileObj, pathRecord) => {
			let trInfoItem: TrInfoItem = {
				fileObj: fileObj,
				pathRecord: pathRecord,
			}
			this.trInfosArray.push(trInfoItem)
		})
	}


	render() {
		return (
			<tbody>{
				this.trInfosArray.map(trInfoItem =>{
					let num: string = trInfoItem.fileObj["@num"]
					const trInfo = this.props.trInfos.get(num)
					if(trInfo === undefined) {
						console.error("programming error on key:", num)
					} else {
						return <MyTr
						key={num}
						fileObj={trInfoItem.fileObj}
						pathRecord={trInfoItem.pathRecord}
						trInfo={trInfo}
						func={this.props.onCheck}
						/>
					}
				})
			}
			</tbody>
		)
	}
}


type MyTrProps = {
	fileObj: FileContent,
	pathRecord: PathRecord,
	trInfo: TrInfo,
	func: (SyntheticInputEvent<HTMLInputElement>) => void
}


class MyTr extends React.Component<MyTrProps> {
	constructor(props) {
		super(props)
	}

	shouldComponentUpdate(nextProps) {
		if(this.props.trInfo.equals(nextProps.trInfo)){
			return false
		}
		return true
	}

	render() {
		return <tr
			className={`${(this.props.fileObj.isMerge) ? 'mergeFile' : ''} ${(this.props.trInfo.toShow) ? '' : 'myHiddenTr'}`}
			>
			<td> <input className='deleteCheck' checked={this.props.trInfo.checked} name="toDelete" type="checkBox" value={this.props.fileObj["@num"]} onChange={this.props.func} /></td>
			<td>{this.props.pathRecord[0]}</td>
			<td>{this.props.pathRecord[1]}</td>
			<td>{this.props.pathRecord[2]}</td>
			<td>{this.props.pathRecord[3]}</td>
			<td>{this.props.pathRecord[4]}</td>
			<td>{this.props.fileObj["案由"]}</td>
		</tr>
	}
}








export default DisplayTable