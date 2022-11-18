import React, { useState, useReducer, useEffect } from "react"

const EMPTY = "UNINITIALIZED"
const CONNECTING = "CONNECTING"
const OPEN = "OPEN"

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
}

const reducer = (state, action) => {
	// console.log(action)
	switch (action.type) {
		case "initializeState":
			return initialState

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

		case "dataRecieved":
			return {
				...state,
				data: action.payload,
				// dataHistory: state.dataHistory.push(action.payload),
			}
		case "addDataConnection":
			return {
				...state,
				dataConnections: state.dataConnections.set(
					action.payload.label,
					action.payload
				),
			}
		case "setConnectionId":
      console.log('setConnectionId' ,action.payload)
			return {
				...state,
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
	const [peer, setPeer] = useState(props.peer)
	let dataCB = () => {}
	// const [dataCB, setDataCB] = useState(()=>{})
	const [status, setStatus] = useState(EMPTY)

	useEffect(() => {
		if (status !== EMPTY) return
		if (state.peerId) return
		dispatch({ type: "setStatus", payload: CONNECTING })
		setStatus(CONNECTING)

		peer.on("close", (p)=>{debugger})
		peer.on("error", (p)=>{debugger})
		peer.on("disconnected", (p)=>{debugger})
		// peer.on("error", console.log )
		// peer.on('disconnected', (event) => {
		// 	console.log('peer disconnected', event)
		// 	// itterate over the open connections
		// 	state.dataConnections.forEach((key, value) => {
		// 		console.log('error', value)
		// 	})	
		// } )

		peer.on("open", (id) => {
			dispatch({ type: "setPeer", payload: peer })
			dispatch({ type: "setPeerId", payload: id })
			dispatch({ type: "setStatus", payload: OPEN })
			setStatus(OPEN)
		})

		peer.on("connection", (dataConnection) => {
			console.log("dataConnection", dataConnection)
			dispatch({ type: "addDataConnection", payload: dataConnection })
			dataConnection.on("data", dataCB)
			dataConnection.on("close", (p)=>{debugger}) // was triggered on moble page refresh
			dataConnection.on("error", (p)=>{debugger})
			dataConnection.on("disconnected", (p)=>{debugger})
	
			// dataConnection.on('disconnected', (event) => {
			// 	console.log('dataCon disconnected', event)
			// 	// itterate over the open connections
			// 	state.dataConnections.forEach((key, value) => {
			// 		console.log('error', value)
			// 	})	
			// } )
			// dataConnection.on('error', (event) => {
			// 	console.log('dataCon error', event)
			// 	// itterate over the open connections
			// 	state.dataConnections.forEach((key, value) => {
			// 		console.log('error', value)
			// 	})	
			// } )
			// dataConnection.on("data", (data) =>
			// 	dispatch({ type: "dataRecieved", payload: data })
			// )
		})
	}, [])

	const storeDataCallback = (cb) => {
		dataCB = cb
		state.dataConnections.forEach(function(value, key) {
			value.on("data", cb)
		})	}

	const connectToPeer = (id) => {
		const connection = peer.connect(id)

		dispatch({ type: "setConnection", payload: connection })
		// connection.on("data", console.log)
		// connection.on("open", console.log)
		connection.on("close", console.log)
		connection.on("error", console.log)

		connection.on("data", (data) =>
			dispatch({ type: "dataRecieved", payload: data })
		)
		connection.on("open", () => {
			dispatch({ type: "setConnectionId", payload: connection.connectionId })
		})
		connection.on("close", console.log)
		connection.on("error", console.log)
	}

	const sendData = (data) => {
    // console.log(state)
		if (state.connection?.connectionId) {
			state.connection.send(data)
		}
	}

	return (
		<RTCContext.Provider
			value={{
				...state,
				dispatch,
				sendData,
				connectToPeer,
				storeDataCallback,
			}}
		>
			{props.children}
		</RTCContext.Provider>
	)
}

export { RTCContext }
export const RTCConsumer = RTCContext.Consumer
export default RTCProvider
