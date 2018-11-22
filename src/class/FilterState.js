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
	volm: RecordOf<StateObj>
}

export type StateType = RecordOf<StateObj>

const defaultStates: StatesObj = {
	year: CreateState(defaultState),
	kind: CreateState(defaultState),
	cas_: CreateState(defaultState),
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
// 	cas_: {
//		currentState: "不篩選",
//		keySet: Set([])
//  },
// 	volu: {
//		currentState: "不篩選",
//		keySet: Set([])
//  },
// }


export function initStatesFromDataDict(dataDictMap: DataDictMap): StatesType {
	const year = statesChainUpdater(List([dataDictMap]))
	const kind = statesChainUpdater(year.listOfMap)
	const cas_ = statesChainUpdater(kind.listOfMap)
	const volm = statesChainUpdater(cas_.listOfMap)

	return CreateStates({
		year: CreateState({
			currentState: "不篩選",
			keySet: year.keys,
			listOfMaps: year.listOfMap
		}),
		kind: CreateState({
			currentState: "不篩選",
			keySet: kind.keys,
			listOfMaps: kind.listOfMap
		}),
		cas_: CreateState({
			currentState: "不篩選",
			keySet: cas_.keys,
			listOfMaps: cas_.listOfMap
		}),
		volm: CreateState({
			currentState: "不篩選",
			keySet: volm.keys,
			listOfMaps: volm.listOfMap
		}),
	})
}

function statesChainUpdater(listOfSubMap: List<DataDictMap>): {keys: KeySet, listOfMap: List<DataDictMap>} {
	let keys: KeySet = Set([])
	let newListOfSubMap: List<DataDictMap> = List([])

	listOfSubMap.map(subMap => {
		const dataObj = subMap.get('data')
		if(subMap.get('sort') === "DataDictObj" && typeof(dataObj) === "object" && dataObj) {
			keys = keys.concat(Object.keys(dataObj))
			newListOfSubMap = newListOfSubMap.concat(Map(dataObj).toList().map(df => Map(df)))

		} else {
			console.error("Programming error, this function shouldn't applied to FileContent: ", subMap.toObject())
		}
	})


	return {keys: keys, listOfMap: newListOfSubMap}

}


// ex: set kind, than modify currentState of year and all states property of cas_, volm
export function setState(key: string, nextState: string, lastStates: StatesType): StatesType {
	const keyOrder = ['year', 'kind', 'cas_', 'volm']
	const index = keyOrder.findIndex((element) => (element === key))

	let newStates = lastStates.update((keyOrder[index]), value => value.set('currentState', nextState))


	let listOfMapTemp: List<DataDictMap> = List([])

	for(var i = index + 1; i < 4; i++) {
		const newStatesContainer = statesChainUpdater(
			listOfMapTemp.equals(List([])) ? lastStates.get(keyOrder[i - 1]).get('listOfMaps') : listOfMapTemp
		)
		const currentState = lastStates.get(keyOrder[i]).get('currentState');

		const newListOfMapTemp = newStatesContainer.listOfMap
		const newKeySet = newStatesContainer.keys
		let newCurrentState = "不篩選"
		for(let map of newListOfMapTemp.values()) {
			if(map.has(currentState)) {
				newCurrentState = currentState
				break;
			}
		}

		newStates = newStates.update(keyOrder[i], (value =>
			value.set(
				'currentState', newCurrentState
			).set(
				'keySet', newKeySet
			).set('listOfMaps', newListOfMapTemp
			)
		))

	}

	return newStates
}

