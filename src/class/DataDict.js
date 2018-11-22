// @flow

import _ from 'lodash'
import { Map, List } from 'immutable'

export type FileJSONObj = {
	"年度號": {"$": string},
	"分類號": {"$": string},
	"案次號": {"$": string},
	"卷次號": {"$": string},
	"目次號": {"$": string},
	"@num": string,
	"案由": {"$": string},
	"有無併件"?: {"$": string},
	"主併檔號"?: {"$": string},
}


export type DataDictMap = Map<string, "DataDictObj" | "FileContent" | boolean | string | {[string]: DF}>
// DataDictMap = Map(DF)

export type DF = DataDictMapObj | FileContent


export type FileContent = {
	sort: "FileContent",
	"@num": string,
	"案由": string,
	isMerge?: boolean
}


export type DataDictMapObj = {
	sort: "DataDictObj",
	data: {[string]: DF}
}

export type PathRecord = Array<string>

export const CreateDataDictMap = (arr: Array<FileJSONObj>): DataDictMap => {
	let dataDictObj = {sort: "DataDictObj", data: {}}
	let lastFile = 'none';
	let mergeFileCount = 1
	for (var i = 0; i < arr.length; i++) {
		let thisFile = arr[i]
		let year = thisFile["年度號"]["$"].toString()
		let kind = thisFile["分類號"]["$"].toString()
		let cas_ = thisFile["案次號"]["$"].toString()
		let volm = thisFile["卷次號"]["$"].toString()
		let file = thisFile["目次號"] ? thisFile["目次號"]["$"] : lastFile
		lastFile = file
		// 併文沒有目次號
		let hasMerge = thisFile["有無併件"]
		let toMerge = thisFile["主併檔號"]

		let fileContent: FileContent = {
			sort: "FileContent",
			"@num": thisFile["@num"].toString(),
			"案由": thisFile["案由"]["$"],
			isMerge: toMerge !== undefined && hasMerge === undefined ? true : false
		}

		const path = [year, kind, cas_, volm, file]

		if(hasMerge !== undefined && toMerge !== undefined) {
			path.push("主文")
		} else if (toMerge !== undefined) {
			path.push("併文" + mergeFileCount.toString())
			mergeFileCount++
		}


		dataDictObj = mySetIn(path, dataDictObj, fileContent)

	}

	return Map(dataDictObj)
}

function mySetIn (path: Array<string>, dataDictMap: DataDictMapObj, value: FileContent): DataDictMapObj {


	const MySet = (subPath: Array<string>, obj: DataDictMapObj, endValue: FileContent): DataDictMapObj => {
		if(subPath.length === 1) {
			return _.set(obj, ['data', subPath[0]], endValue)
		} else {
			const subObj = _.has(obj, ['data', subPath[0]]) ? _.get(obj, ['data', subPath[0]]) : {sort: "DataDictObj", data: {}}
			return _.set(obj, ['data', subPath[0]], MySet(subPath.slice(1), subObj, endValue))
		}
	}

	const newDataDictObj = MySet(path, dataDictMap, value)

	return newDataDictObj
}

function mapToFileContent(fileMap: DataDictMap): ?FileContent {
	if(fileMap.get('sort') === "FileContent"){
		const obj = fileMap.toObject()

		let targetObj: FileContent = {
			sort: "FileContent",
			"@num": '',
			"案由": '',
			isMerge: false
		}
		return Object.assign(targetObj, obj)
	} else {
		return undefined
	}
}


function _iterateMap(pathRecord: List<string>, dictMap: DataDictMap, cbFileContent) {
	if(dictMap.get('sort') === "FileContent") {
		const f = mapToFileContent(dictMap)
		f ? cbFileContent(f, pathRecord.toArray()) : console.error("Programming error")
	} else {
		_.forOwn(dictMap.get('data'), (value: DF, key) => {
			_iterateMap(pathRecord.push(key), Map(value), cbFileContent)
		})
	}
}

export function iterateMap(dictMap: DataDictMap, cbFileContent: (file: FileContent, path: PathRecord) => mixed) {
	_iterateMap(List([]), dictMap, cbFileContent)
}


