// @flow

import _ from 'lodash'


type FileJSONObj = {
	"年度號": {"$": number},
	"分類號": {"$": number},
	"案次號": {"$": number},
	"卷次號": {"$": number},
	"目次號": {"$": number},
	"@num": number,
	"案由": {"$": string},
	"有無併件"?: {"$": string},
	"主併檔號"?: {"$": string},
}



export type DataDictObj = {	[number | string]: DataDictObj | FileContent }

type FileContent = {
	"@num": number,
	"案由": string,
	"isMerge"?: boolean
}

type PathRecord = Array<string>

export class DataDict {
	obj: DataDictObj;
	buildFromObjectArr: () => mixed;

	constructor(dataDictObj?: {} = {}) {
		// this.obj = Object.create(dataDictObj)
		this.obj = _.cloneDeep(dataDictObj)
		// this._iterateDict = this._iterateDict.bind(this)

	}

	buildFromObjectArr(arr: Array<FileJSONObj>) {
		// 解決併文無檔號之問題
		let lastFile = 0;			// 若 DataDict 的目次號中出現 0，代表有沒有主文的併文
		let mergeFileCount = 1
		for (var i = 0; i < arr.length; i++) {
		    let thisFile = arr[i]
		    let keysToBeRemoved = Object.keys(thisFile).filter(x => !["@num", "年度號", "分類號", "案次號", "卷次號", "目次號", "案由", "主併檔號", "有無併件"].includes(x))
		    keysToBeRemoved.map(key => {
		        delete arr[i][key]
		    })
		    let year = thisFile["年度號"]["$"]
		    let kind = thisFile["分類號"]["$"]
		    let cas_ = thisFile["案次號"]["$"]
		    let volm = thisFile["卷次號"]["$"]
			if(!this.obj[year]) {
				this.obj[year] = {}
			}
			if(!this.obj[year][kind]) {
				this.obj[year][kind] = {}
			}
			if(!this.obj[year][kind][cas_]) {
				this.obj[year][kind][cas_] = {}
			}
			if(!this.obj[year][kind][cas_][volm]) {
				this.obj[year][kind][cas_][volm] = {}
			}

			let fileContent: FileContent = {
				"@num": thisFile["@num"],
				"案由": thisFile["案由"]["$"],
			}
			let hasMerge = thisFile["有無併件"]
			let toMerge = thisFile["主併檔號"]

			if(hasMerge) {
				let file = thisFile["目次號"]["$"]
				this.obj[year][kind][cas_][volm][file] = {
					"主文": fileContent,
				}
				lastFile = file
			} else if(toMerge){
				fileContent["isMerge"] = true
				this.obj[year][kind][cas_][volm][lastFile]["併文" + mergeFileCount.toString()] = fileContent
				mergeFileCount = mergeFileCount + 1
			} else {
				let file = thisFile["目次號"]["$"]
				this.obj[year][kind][cas_][volm][file] = fileContent
			}
		}
	}

}


function _iterateDict(
		pathRecord: PathRecord,
		dictObj: DataDictObj | FileContent,
		stopCondition,
		proccessNode
	) {
	if(stopCondition(dictObj, pathRecord)) {
		proccessNode(dictObj, pathRecord)
	} else {
		// Object.keys(dictObj).map(key => {
		_.forOwn(dictObj, (value, key) => {
			_iterateDict(pathRecord.concat([key]), dictObj[key], stopCondition, proccessNode)
		})
	}
}

// pass dataDictObj by reference
export function iterateDict (
		dictObject: DataDictObj,
		stopCondition: (obj: DataDictObj | FileContent,	pathRecord?: PathRecord) => boolean,
		proccessNode: (obj: DataDictObj | FileContent, pathRecord?: PathRecord) => mixed
	) {
	_iterateDict([], dictObject, stopCondition, proccessNode)
}

