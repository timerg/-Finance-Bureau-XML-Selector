// @flow

import { Record, Set, List, Map, fromJS, isRecord } from 'immutable'
import type { RecordFactory, RecordOf } from 'immutable';
import type { DataDictMap, DF } from 'class/DataDict'

type KeySet = Set<string>

type StateObj = {
	currentState: string,
	keySet: KeySet,
	listOfMaps: List<DataDictMap>
}


const defaultState: StateObj = {
	currentState: "不篩選",
	keySet: Set([]),
	listOfMaps: List([])
}

const CreateState: RecordFactory<StateObj> = Record(defaultState)

type StatesObj = {
	year: RecordOf<StateObj>,
	kind: RecordOf<StateObj>,
	cas_: RecordOf<StateObj>,
	volm: RecordOf<StateObj>,
	file: RecordOf<StateObj>,
}

export type StateType = RecordOf<StateObj>

const defaultStates: StatesObj = {
	year: CreateState(defaultState),
	kind: CreateState(defaultState),
	cas_: CreateState(defaultState),
	volm: CreateState(defaultState),
	file: CreateState(defaultState),
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
// 	cas_: {
//		currentState: "不篩選",
//		keySet: Set([])
//  },
// 	volm: {
//		currentState: "不篩選",
//		keySet: Set([])
//  },
//	file: {
//		currentState: "不篩選",
//		keySet: Set([])
//  },
// }


export function initStatesFromDataDict(dataDictMap: DataDictMap): StatesType {
	// const year = statesChainUpdater(List([dataDictMap]))

	let year;
	let dataObj = dataDictMap.get('data')
	if(dataObj !== undefined && typeof(dataObj) === "object") {
		year = {
			keys: Set(Map(dataObj).keys()),
			listOfMaps: List([dataDictMap])
		}
	} else {
		year = {
			keys: Set([]),
			listOfMaps: List([dataDictMap])
		}
	}

	const kind = statesChainUpdater(List([dataDictMap]))
	const cas_ = statesChainUpdater(kind.listOfMaps)
	const volm = statesChainUpdater(cas_.listOfMaps)
	const file = statesChainUpdater(volm.listOfMaps)

	return CreateStates({
		year: CreateState({
			currentState: "不篩選",
			keySet: year.keys,
			listOfMaps: year.listOfMaps
		}),
		kind: CreateState({
			currentState: "不篩選",
			keySet: kind.keys,
			listOfMaps: kind.listOfMaps
		}),
		cas_: CreateState({
			currentState: "不篩選",
			keySet: cas_.keys,
			listOfMaps: cas_.listOfMaps
		}),
		volm: CreateState({
			currentState: "不篩選",
			keySet: volm.keys,
			listOfMaps: volm.listOfMaps
		}),
		file: CreateState({
			currentState: "不篩選",
			keySet: file.keys,
			listOfMaps: file.listOfMaps
		}),
	})
}

function statesChainUpdater(upperListOfSubMap: List<DataDictMap>, upperState?: string = "不篩選"): {keys: KeySet, listOfMaps: List<DataDictMap>} {
	let keys: KeySet = Set([])
	let newListOfSubMap: List<DataDictMap> = List([])

	upperListOfSubMap.map(subMap => {
		const dataObj = subMap.get('data')
		if(subMap.get('sort') === "DataDictObj" && typeof(dataObj) === "object" && dataObj) {
			let mapOfDataObj = Map(dataObj)
			if(upperState !== "不篩選") {
				mapOfDataObj = mapOfDataObj.filter((v, k) => (k === upperState))
			}
			newListOfSubMap = newListOfSubMap.concat(mapOfDataObj.toList().map(df => {
				if(df.sort === "DataDictObj") {
					keys = keys.concat(Object.keys(df.data))
				}
				return Map(df)
			}))

		} else {
			console.error("Programming error, this function shouldn't applied to FileContent: ", subMap.toObject())
		}
	})

	return {keys: keys, listOfMaps: newListOfSubMap}

}


// ex: set kind, than modify currentStateVal of year and all states property of cas_, volm
export function setState(key: string, nextState: string, lastStates: StatesType): StatesType {
	const keyOrder = ['year', 'kind', 'cas_', 'volm', 'file']
	const index = keyOrder.findIndex((element) => (element === key))

	let newStates = lastStates.update((keyOrder[index]), value => value.set('currentState', nextState))


	let listOfMapTemp: List<DataDictMap> = List([])
	let currentStateValTemp: string = nextState

	for(var i = index + 1; i < 5; i++) {
		const newStatesContainer = statesChainUpdater(
			listOfMapTemp.equals(List([])) ? lastStates.get(keyOrder[i - 1]).get('listOfMaps') : listOfMapTemp,
			currentStateValTemp
		)
		const currentStateVal = lastStates.get(keyOrder[i]).get('currentState');

		const newListOfMapTemp = newStatesContainer.listOfMaps
		const newKeySet = newStatesContainer.keys
		let newCurrentStateVal = "不篩選"
		for(let map of newListOfMapTemp.values()) {
			if(map.has(currentStateVal)) {
				newCurrentStateVal = currentStateVal
				break;
			}
		}
		listOfMapTemp = newListOfMapTemp

		currentStateValTemp = newCurrentStateVal
		newStates = newStates.update(keyOrder[i], (value =>
			value.set(
				'currentState', newCurrentStateVal
			).set(
				'keySet', newKeySet
			).set('listOfMaps', newListOfMapTemp
			)
		))


	}


	return newStates
}



