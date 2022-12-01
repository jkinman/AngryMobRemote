import React, { useState, useReducer, useEffect } from "react"

const makeEnum = (arr) => {
    let obj = Object.create(null);
    for (let val of arr){
        obj[val] = Symbol(val);
    }
    return Object.freeze(obj);
}

const NavState = makeEnum(['begin', 'preload', 'welcome', 'vaporwave' ])
const initialState = {
	isRemote: false,
	isClient: false,
	peerId: false,
	showAbout:false,
	loading:false,
	preloadProgress: false,
	navState: NavState.begin,
}

const reducer = (state, action) => {
	switch (action.type) {
		case "initializeState":
			return initialState

		default:
			return state
	}
}

const AppContext = React.createContext()

const AppProvider = (props) => {
	const [state, dispatch] = React.useReducer(reducer, initialState)

	const setPeerId = id => dispatch({type:'setPeerId', payload: id})

	return (
		<AppContext.Provider
			value={{
				...state,
				dispatch,
				setPeerId,
			}}
		>
			{props.children}
		</AppContext.Provider>
	)
}

export { AppContext }
export const AppConsumer = AppContext.Consumer
export default AppProvider
