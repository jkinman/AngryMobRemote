import React, { useState, useReducer, useEffect } from "react"

const initialState = {
	isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && DeviceMotionEvent.requestPermission,
	permissionStatus: false,
	permissionGranted: false,
	deviceOrientation: { alpha: 0, beta: 0, gamma: 0, timeStamp: 0 },
	deviceMotion: { x: 0, y: 0, z: 0, timeStamp: 0 },
	scrollY: window.scrollY,
}

const reducer = (state, action) => {
	switch (action.type) {
		case "initializeState":
			return initialState

		case "device/setPermissionStatus":
			return {
				...state,
				permissionGranted: state === "granted",
				permissionStatus: action.payload,
			}

		case "device/setDeviceOrientation":
			return {
				...state,
				alpha: action.payload.alpha,
				deviceOrientation: {
					alpha: action.payload.alpha, //z
					beta: action.payload.beta, //x
					gamma: action.payload.gamma, //y
					timeStamp: action.timeStamp,
				},
			}

		case "device/setDeviceMotion":
			return {
				...state,
				deviceMotion: {
					x: action.payload.acceleration.x,
					y: action.payload.acceleration.y,
					z: action.payload.acceleration.z,
					timeStamp: action.timeStamp,
				},
			}

		case "device/setScroll":
			return {
				...state,
				scrollY: action.payload,
			}

		default:
			return state
	}
}

const DeviceMetricsContext = React.createContext()

const DeviceMetricsProvider = (props) => {
	const [state, dispatch] = React.useReducer(reducer, initialState)

	useEffect(() => {
		window.addEventListener("scroll", handleScrollCallback, true)
		enableDeviceOrientationCallback()
	}, [])

	const linkHandlers = () => {
		window.addEventListener("deviceorientation", handleDeviceOrientation, true)
		window.addEventListener("devicemotion", handleDeviceMotion, true)
	}

	const enableDeviceOrientationCallback = () => {
		if (state.isMobile) {
			// Handle iOS 13+ devices.
			DeviceMotionEvent.requestPermission()
				.then((state) => {
					dispatch({ type: "device/setPermissionStatus", payload: state })
					if (state === "granted") {
						linkHandlers()
					} else {
						console.error("Request to access the orientation was rejected")
					}
				})
				.catch((err) => {
					console.error(err)
				})
		} else {
			// Handle regular non iOS 13+ devices.
			linkHandlers()
		}
	}

	const handleDeviceOrientation = (event) => {
		dispatch({ type: "device/setDeviceOrientation", payload: event })
	}

	const handleDeviceMotion = (event) => {
		dispatch({ type: "device/setDeviceMotion", payload: event })
	}

	const handleScrollCallback = (event) => {
		dispatch({
			type: "device/setScroll",
			payload: window.scrollY,
		})
	}

	return (
		<DeviceMetricsContext.Provider
			value={{
				...state,
				dispatch,
				enableDeviceOrientationCallback,
			}}
		>
			{props.children}
		</DeviceMetricsContext.Provider>
	)
}

export { DeviceMetricsContext }
export const DeviceMetricsConsumer = DeviceMetricsContext.Consumer
export default DeviceMetricsProvider
