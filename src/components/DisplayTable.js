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
						toShow={trInfo.toShow}
						checked={trInfo.checked}
						func={this.props.onCheck}
						/>
					}
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