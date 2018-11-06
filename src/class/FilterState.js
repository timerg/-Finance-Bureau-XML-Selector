class FilterState{
	constructor(obj = {
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
	
	toArray(numOfLevel) {
		if(numOfLevel > 4) {
			console.error("FilterState level out of range. It should be no more than 4")
			return []
		}
		let arr = [this["年度號"], this["分類號"], this["案次號"], this["卷次號"]]
		return arr.slice(0, numOfLevel)
	}

	setState(obj) {
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

export default FilterState