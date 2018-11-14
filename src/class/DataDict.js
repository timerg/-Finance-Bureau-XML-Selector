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


export type DataDictObj = {
	sort: "DataDictObj",
	[number | string]: DF
}

export type FileContent = {
	sort: "FileContent",
	"@num": number,
	"案由": string,
	isMerge?: boolean
}

export type DF = DataDictObj | FileContent;


export type PathRecord = Array<string>

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
				this.obj[year] = {sort: "DataDictObj"}
			}
			if(!this.obj[year][kind]) {
				this.obj[year][kind] = {sort: "DataDictObj"}
			}
			if(!this.obj[year][kind][cas_]) {
				this.obj[year][kind][cas_] = {sort: "DataDictObj"}
			}
			if(!this.obj[year][kind][cas_][volm]) {
				this.obj[year][kind][cas_][volm] = {sort: "DataDictObj"}
			}

			let fileContent: FileContent = {
				sort: "FileContent",
				"@num": thisFile["@num"],
				"案由": thisFile["案由"]["$"],
			}
			let hasMerge = thisFile["有無併件"]
			let toMerge = thisFile["主併檔號"]

			if(hasMerge) {
				let file = thisFile["目次號"]["$"]
				this.obj[year][kind][cas_][volm][file] = {
					sort: "DataDictObj",
					"主文": fileContent,
				}
				lastFile = file
			} else if(toMerge){
				fileContent.isMerge = true
				this.obj[year][kind][cas_][volm][lastFile] = {sort: "DataDictObj"}
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
		dictObj: DF,
		proccessNode
	) {
	if(dictObj.sort === "FileContent") {
	// if(dictObj.kind === "FileContent") {
		proccessNode(dictObj, pathRecord)
	} else {
		_.forOwn(dictObj, (value, key) => {
			_iterateDict(pathRecord.concat([key]), dictObj[key], proccessNode)
		})
	}
}



// pass dataDictObj by reference
export function iterateDict (
		dictObject: DataDictObj,
		proccessNode: (obj: FileContent, pathRecord: PathRecord) => mixed
	) {
	_iterateDict([], dictObject, proccessNode)
}

