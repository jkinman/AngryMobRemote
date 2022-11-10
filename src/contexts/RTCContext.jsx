import React, { useState, useReducer, useEffect } from "react"
import { Peer } from "peerjs"

const initialState = {
  peer: new Peer(),
  connection: {},
  data: false,
  dataHistory:[],
	peerId: false,
	peerConnection: false,
	connectionID: false,
}

const reducer = (state, action) => {
	switch (action.type) {
		case "initializeState":
			return initialState

		case "setConnection":
			return {
				...state,
				connection: action.payload,
			}

		case "dataRecieved":
			return {
				...state,
				data: action.payload,
        dataHistory: state.dataHistory.push(action.payload)
			}

		case "setID":
			return {
				...state,
				connectionID: action.payload,
			}

		default:
			return state
	}
}

const RTCContext = React.createContext()

const RTCProvider = (props) => {
	const [state, dispatch] = React.useReducer(reducer, initialState)

	useEffect(() => {

	}, [])

  const connectToPeer = id => {

    const connection = state.peer.connect(id)
    
    dispatch({type: 'setConnection', payload: connection})
		connection.on("data", console.log)
		connection.on("open", console.log)
		connection.on("close", console.log)
		connection.on("error", console.log)

		connection.on("data", data => dispatch({type: 'dataRecieved', payload: data}))
		connection.on("open", console.log)
		connection.on("close", console.log)
		connection.on("error", console.log)

    console.log('connection: ', connection)
    console.log('peer: ', state.peer)
    dispatch({type: 'setConnection', payload: connection})
    dispatch({type: 'setPeerID', payload: id})
  }

  // const createPeer = () =>{
  //   const peer = new Peer()
  // }

  const sendData = (data) => {
		state.connection.send("uplink established")
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
