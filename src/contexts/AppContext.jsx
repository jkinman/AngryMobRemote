import React, { useState, useReducer, useEffect } from "react"

const makeEnum = (arr) => {
	let obj = Object.create(null)
	for (let val of arr) {
		obj[val] = Symbol(val)
	}
	return Object.freeze(obj)
}

const NavState = makeEnum(["begin", "preload", "welcome", "vaporwave"])
const initialState = {
	isRemote: false,
	isClient: false,
	RTCId: false,
	showAbout: false,
	showCV: false,
	show3DControls: false,
	loading: false,
	preloadProgress: false,
	navState: NavState.begin,
}

const reducer = (state, action) => {
	switch (action.type) {
		case "initializeState":
			return initialState

		case "setRTCId":
			return {
				...state,
				RTCId: action.payload,
				isClient: false,
				isRemote: true,
			}

		case "setIsClient":
			return {
				...state,
				isClient: action.payload,
				isRemote: !action.payload,
			}

		case "setShow3DControls":
			return {
				...state,
				show3DControls: action.payload,
			}

		case "setShowAbout":
			return {
				...state,
				showAbout: action.payload,
				showCV: false,
			}
		case "setShowCV":
			return {
				...state,
				showAbout: false,
				showCV: action.payload,
			}

			return state
		default:
			return state
	}
}

const AppContext = React.createContext()

const AppProvider = (props) => {
	const [state, dispatch] = React.useReducer(reducer, initialState)

	const toggleAbout = (param) => {
		const show = param ? param : !state.showAbout
		dispatch({ type: "setShowAbout", payload: show })
	}
	const toggleCV = (param) => {
		const show = param ? param : !state.showCV
		dispatch({ type: "setShowCV", payload: show })
	}

	const setRTCId = (id) => dispatch({ type: "setRTCId", payload: id })
	const setIsClient = (val) => dispatch({ type: "setIsClient", payload: val })
	const setShow3DControls = (val) =>
		dispatch({ type: "setShow3DControls", payload: val })

	return (
		<AppContext.Provider
			value={{
				...state,
				dispatch,
				setRTCId,
				setShow3DControls,
				setIsClient,
				toggleAbout,
				toggleCV,
			}}
		>
			{props.children}
		</AppContext.Provider>
	)
}

export { AppContext }
export const AppConsumer = AppContext.Consumer
export default AppProvider
