import React, { useState, useEffect } from "react"
import { Peer } from "peerjs"
import QRCode from "qrcode"

const EMPTY = "UNINITIALIZED"
const CONNECTING = "CONNECTING"
const OPEN = "OPEN"
const CONNECTED = "CONNECTED"

const initialState = {
	status: EMPTY,
	peer: {},
	connection: {},
	dataConnections: new Map(),
	data: false,
	dataHistory: [],
	peerId: false,
	connectionId: false,
	peerConnection: false,
	dataHandler: false,
}

const reducer = (state, action) => {
	// console.log(action)
	switch (action.type) {
		case "initializeState":
			return initialState

		case "setStateTransferHandler":
			return {
				...state,
				stateTransferHandler: action.payload,
			}

		case "setConnection":
			return {
				...state,
				connection: action.payload,
			}
		case "setStatus":
			return {
				...state,
				status: action.payload,
			}
		case "setDataHandler":
			return {
				...state,
				dataHandler: action.payload,
			}

		case "dataRecieved":
			return {
				...state,
				data: action.payload,
				// dataHistory: state.dataHistory.push(action.payload),
			}
		case "disconnection":
			return {
				...state,
				dataConnections: initialState.dataConnections,
				peerConnection: false,
			}
		case "addDataConnection":
			return {
				...state,
				dataConnections: state.dataConnections.set(
					action.payload.label,
					action.payload
				),
				peerConnection: true,
			}
	case "setConnectionId":
		return {
			...state,
			status: CONNECTED,
			connectionId: action.payload,
		}
		case "setPeerId":
			return {
				...state,
				peerId: action.payload,
			}
		case "setPeer":
			return {
				...state,
				peer: action.payload,
			}

		default:
			return state
	}
}

const RTCContext = React.createContext()

const RTCProvider = (props) => {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const [peer] = useState(() => new Peer())
	const [stateTransferHandler, setStateTransferHandler] = useState(() => (data) => {})
	let dataCB = () => {}
	const [status, setStatus] = useState(EMPTY)

	useEffect(() => {
		// Only initialize once - check if peer already has an ID or is already open
		if (peer.id || peer.open) {
			// If peer is already open but state doesn't have the ID, update it
			if (peer.id && !state.peerId) {
				dispatch({ type: "setPeer", payload: peer })
				dispatch({ type: "setPeerId", payload: peer.id })
				dispatch({ type: "setStatus", payload: OPEN })
				setStatus(OPEN)
			}
			return
		}

		dispatch({ type: "setStatus", payload: CONNECTING })
		setStatus(CONNECTING)

		peer.on("close", (p) => {
			// debugger
		})
		peer.on("error", (p) => {
			dispatch({ type: "disconnection", payload: p })
		})
		peer.on("disconnected", (p) => {
			dispatch({ type: "disconnection", payload: p })
		})

		peer.on("open", (id) => {
			dispatch({ type: "setPeer", payload: peer })
			dispatch({ type: "setPeerId", payload: id })
			dispatch({ type: "setStatus", payload: OPEN })
			setStatus(OPEN)
		})

		peer.on("connection", (dataConnection) => {
			dispatch({ type: "setStatus", payload: CONNECTED })
			setStatus(CONNECTED)

			dispatch({ type: "addDataConnection", payload: dataConnection })
			dataConnection.on("data", (data) => dataIncoming(data))
			dataConnection.on("close", (p) => {
				dispatch({ type: "disconnection", payload: p })
			})
			dataConnection.on("error", (p) => {
				dispatch({ type: "disconnection", payload: p })
			})
			dataConnection.on("disconnected", (p) => {
				dispatch({ type: "disconnection", payload: p })
			})
		})
	}, [peer])

	const dataIncoming = (data) => {
		if (data.data) dataCB(data.data)
		if (data.state && stateTransferHandler)  stateTransferHandler( data.state )
	}
	const storeDataCallback = (cb) => {
		// setDataCB(cb)
		dataCB = cb
		dispatch({ type: "setDataHandler", payload: cb })
		// debugger
		state.dataConnections.forEach(function (value, key) {
			value.on("data", dataIncoming)
		})
	}

	const connectToPeer = (id) => {
		const connection = peer.connect(id)

		dispatch({ type: "setConnection", payload: connection })
		// connection.on("data", console.log)
		// connection.on("open", console.log)
		connection.on("close", console.log)
		connection.on("error", (p) =>
			dispatch({ type: "disconnection", payload: p })
		)

		connection.on("data", (data) =>
			dispatch({ type: "dataRecieved", payload: data })
		)
		connection.on("open", () => {
			dispatch({ type: "setConnectionId", payload: connection.connectionId })
		})
		connection.on("close", (p) =>
			dispatch({ type: "disconnection", payload: p })
		)
		connection.on("error", console.log)
	}

	const sendData = (data) => {
		if (state.connection?.connectionId && state.status === CONNECTED) {
			// console.log(data)
			state.connection.send(data)
		}
	}

	const updateState = (data) => {
		if (state.connection?.connectionId && state.status === CONNECTED) {
			// console.log(data)
			state.connection.send(data)
		}
	}
	// const setStateTransferHandler= (handler) => {
	// 	dispatch({type:'setStateTransferHandler', payload:handler})
	// }
	const getQRLink = (light, dark) => {
		const qrLink = `${window.location.origin}?id=${state.peerId}`
		return QRCode.toDataURL(
			qrLink,
			{
				errorCorrectionLevel: "L",
				version: 5,
				type: "image/jpeg",
				quality: 0.5,
				margin: 1,
				color: {
					light,
					dark,
				},
			},
			(err, url) => {
				if (err) console.error(err)
				else {
					return url
				}
			}
		)
	}

	return (
		<RTCContext.Provider
			value={{
				...state,
				dispatch,
				getQRLink,
				sendData,
				connectToPeer,
				storeDataCallback,
				updateState,
				setStateTransferHandler,
			}}
		>
			{props.children}
		</RTCContext.Provider>
	)
}

export { RTCContext }
export const RTCConsumer = RTCContext.Consumer
export default RTCProvider
