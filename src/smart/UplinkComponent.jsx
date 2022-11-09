import React, { useEffect, useContext } from 'react'

import { DeviceMetricsContext } from '../contexts/DeviceMetricsContext'
import ConnectionStatus from '../dumb/ConnectionStatus'

import * as peerjs from '../modules/WebRTCPeer.js'

let connection

const UplinkComponent = (props) => {
    const appState = useContext(DeviceMetricsContext)

    useEffect(()=>{
      connection = peerjs.connect("092b7f7b-c0ab-4572-9011-fad75fd94cef")
      appState.dispatch({type:'connection/setPeer', payload: connection})
      appState.dispatch({type:'connection/setPeerID', payload: connection.peer})  
      console.log( connection )
    }, [])
  
    return(
        <div>
            <ConnectionStatus connection={appState.peerConnection}/>
        </div>
    )
  } 
  
  export default UplinkComponent
