import React, { useEffect, useContext } from 'react'

import { AppContext } from '../contexts/AppContext'

import * as peerjs from '../modules/WebRTCPeer.js'
import * as DeviceOrientation from '../modules/DeviceOrientation'

let connection

const UplinkComponent = (props) => {
    const appState = useContext(AppContext)

    useEffect(()=>{
      DeviceOrientation.init()
      connection = peerjs.connect("092b7f7b-c0ab-4572-9011-fad75fd94cef")
      appState.dispatch({type:'connection/setPeer', payload: connection})
      appState.dispatch({type:'connection/setPeerID', payload: connection.peer})
  
      console.log( connection )
    }, [])
  
    return(
        <div>
            <h1>UplinkComponent</h1>
            <h4>connectionID: {appState.peerID}</h4>
            <h4>label: {appState.peerConnection?.label}</h4>
        </div>
    )
  } 
  
  export default UplinkComponent
