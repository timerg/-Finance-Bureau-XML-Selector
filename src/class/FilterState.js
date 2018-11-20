

import { Record, Set, List, Map, fromJS } from 'immutable'
import type { RecordFactory, RecordOf } from 'immutable';
import type { DataDictObj, DF } from 'class/DataDict'

export type FilterStateType = {
	"年度號": string,
	"分類號": string,
	"案次號": string,
	"卷次號": string,
	toArray: (number) => Array<string>
}

export class FilterState {
	constructor(obj: {} = {
		"年度號": "不篩選",
		"分類號": "不篩選",
		"案次號": "不篩選",
		"卷次號": "不篩選"
    }) {
        this["年度號"] = obj["年度號"]
        this["分類號"] = obj["分類號"]
        this["案次號"] = obj["案次號"]
        this["卷次號"] = obj["卷次號"]

		this.toArray = this.toArray.bind(this)
		Object.freeze(this)

	}

	print() {
		return "|年度號: " + this["年度號"] + ", 分類號: " + this["分類號"] + ", 案次號: " + this["案次號"] + ", 卷次號: " + this["卷次號"]
	}

	toArray(numOfLevel: number) {
		if(numOfLevel > 4) {
			console.error("FilterState level out of range. It should be no more than 4")
			return []
		}
		let arr = [this["年度號"], this["分類號"], this["案次號"], this["卷次號"]]
		return arr.slice(0, numOfLevel)
	}

	setState(obj: {[string]: number | string}) {
		// ex: this={96, 0202, 1, 003} obj={分類號: 0205}  => return {{96, 0205, 不篩選, 不篩選}}
		let newState = (new FilterState(
			Object.assign({
				"年度號": null,
				"分類號": null,
				"案次號": null,
				"卷次號": null
			}, obj))).toArray(4)
		let stateArr = this.toArray(4)
		let state = null
		for(var i = 0; i < 4; i++) {
			if(newState[i]) {
				if(newState[i] != "不篩選") {
					// the filter after this one should become "不篩選"
					state = "不篩選"
				}
			} else {
				if(!state) {
					newState[i] = stateArr[i]
				} else {
					newState[i] = state
				}
			}

		}


		return new FilterState({
			"年度號": newState[0],
			"分類號": newState[1],
			"案次號": newState[2],
			"卷次號": newState[3]
		})
	}
}



function getStatesArrFromDict_(stateArr, dataDictObj, selectionsSetArr, level) {
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




// ==============

type KeysSet = Set<string>

type StateObj = {
	currentState: string,
	keySet: KeysSet
}


const defaultState: StateObj = {
	currentState: "不篩選",
	keySet: Set([])
}

const CreateState: RecordFactory<StateObj> = Record(defaultState)

type StatesObj = {
	year: RecordOf<StateObj>,
	kind: RecordOf<StateObj>,
	case: RecordOf<StateObj>,
	volm: RecordOf<StateObj>
}

const defaultStates: StatesObj = {
	year: CreateState(defaultState),
	kind: CreateState(defaultState),
	case: CreateState(defaultState),
	volm: CreateState(defaultState)
}

export const CreateStates: RecordFactory<StatesObj> = Record(defaultStates);


export type StatesType = RecordOf<StatesObj>
// {
// 	year: {
//		currentState: "不篩選",
//		keySet: Set([])
//  },
// 	kind: {
//		currentState: "不篩選",
//		keySet: Set([])
//  },
// 	case: {
//		currentState: "不篩選",
//		keySet: Set([])
//  },
// 	volu: {
//		currentState: "不篩選",
//		keySet: Set([])
//  },
// }

function dfToMap(obj: DF): Map<string, DataDictObj> {
	if (obj.sort === "DataDictObj") {
		let tempMap = Map();
		Object.keys(obj).forEach(key => {
			if (key !== "sort") {
				if(obj[key].sort === "DataDictObj") {
					tempMap.set(key, obj[key]);
				}
			}
		});
		return tempMap;
	} else {
		return Map();
	}
}

export function setStatesFromDataDict(state: StatesType, dataDictObj: DataDictObj) {
	// const dataDictObjMap:  Map<> = fromJS(dataDictObj)
	const dataDictObjMap = dfToMap(dataDictObj)
	// "年度號"
	let [yearKeysSet, yearMapOfSubtree] = setStatesFromOneLayerDataDict(state.get('year').get('currentState'), dataDictObjMap)
	// "分類號"
	// let [kindKeysSet, kindMapOfSubtree] = setStatesFromOneLayerDataDict(state.get('kind').get('currentState'), yearMapOfSubtree)
	// // "案次號"
	// let [caseKeysSet, caseMapOfSubtree] = setStatesFromOneLayerDataDict(state.get('case').get('currentState'), kindMapOfSubtree)
	// // "卷次號"
	// let [volmKeysSet, volmMapOfSubtree] = setStatesFromOneLayerDataDict(state.get('volm').get('currentState'), volmMapOfSubtree)

	// const newState = state.set(year)
	return state

}

function setStatesFromOneLayerDataDict(currentState: string, mapOfSubtree: Map<string, DataDictObj>): Array<KeysSet | Map<string, DataDictObj>> {
	const keysSet = Set(mapOfSubtree.keys())
	let newMapOfSubtree: Map<string, DataDictObj> ;
	if(currentState === "不篩選") {
		newMapOfSubtree = flatten(mapOfSubtree)
	} else {
		newMapOfSubtree = mapOfSubtree.filter((value, key) =>
			key === currentState
		)

		newMapOfSubtree = flatten(newMapOfSubtree)
	}
	return [keysSet, newMapOfSubtree]
}

function flatten(map: Map<string, DataDictObj>): Map<string, DataDictObj> {
	return map.delete('sort').flatten(true)
}

