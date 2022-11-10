import React, { useState, useReducer, useEffect } from "react"

const EMPTY = 'UNINITIALIZED'
const CONNECTING = 'CONNECTING'
const OPEN = 'OPEN'

const initialState = {
	status: EMPTY,
	peer: {},
	connection: {},
	dataConnections: new Map(),
	data: false,
	dataHistory: [],
	peerId: false,
	connectionID: false,
	peerConnection: false,
}

const reducer = (state, action) => {
	switch (action.type) {
		case "initializeState":
			return initialState

		case "setConnection":
			return {
				...state,
        connectionID: action.payload.connectionId,
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
		case "setConnectionID":
			return {
				...state,
				connectionID: action.payload,
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
	const [status, setStatus] = useState(EMPTY)

	useEffect(() => {
		if (status !== EMPTY) return
		if (state.peerId) return
		dispatch({ type: "setStatus", payload: CONNECTING })
    setStatus(CONNECTING)

		peer.on("close", console.log)
		peer.on("error", console.log)
		peer.on("data", (data) => dispatch({ type: "dataRecieved", payload: data }))

		peer.on("open", (id) => {
			dispatch({ type: "setPeer", payload: peer })
			dispatch({ type: "setPeerId", payload: id })
			dispatch({ type: "setStatus", payload: OPEN })
      setStatus(OPEN)
		})

		peer.on("connection", (dataConnection) => {
			console.log("dataConnection", dataConnection)
			dispatch({ type: "addDataConnection", payload: dataConnection })
      dataConnection.on("data", (data) => dispatch({ type: "dataRecieved", payload: data }))
		})
	}, [])

	const connectToPeer = (id) => {
		const connection = peer.connect(id)

		dispatch({ type: "setConnection", payload: connection })
		connection.on("data", console.log)
		connection.on("open", console.log)
		connection.on("close", console.log)
		connection.on("error", console.log)

		connection.on("data", (data) =>
			dispatch({ type: "dataRecieved", payload: data })
		)
		connection.on("connection", (id, p2) => {
			console.log("openEvent", id)
			dispatch({ type: "setConnectionID", payload: id })
		})
		connection.on("close", console.log)
		connection.on("error", console.log)
	}

	const sendData = (data) => {
    if(state.connectionID){
      state.connection.send( data )
    }
	}

	return (
		<RTCContext.Provider
			value={{
				...state,
				dispatch,
				sendData,
				connectToPeer,
			}}
		>
			{props.children}
		</RTCContext.Provider>
	)
}

export { RTCContext }
export const RTCConsumer = RTCContext.Consumer
export default RTCProvider
