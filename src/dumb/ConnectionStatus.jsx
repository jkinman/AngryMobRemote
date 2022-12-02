import React, { useEffect, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTowerBroadcast } from '@fortawesome/free-solid-svg-icons'

import './ConnectionStatus.scss'
const ConnectionStatus = (props) => {

    const {data, sendData, status, connection, peer, connectionID, dataConnections} = props

    return(
        <div className='connection-status'>
            <h5>RTC status</h5> 
            <p> {status} {status === 'CONNECTED' && <span><FontAwesomeIcon icon={faTowerBroadcast} className="broadcast-icon" /> </span>}</p>
        
            {/* <FontAwesomeIcon icon="fa-regular fa-tower-broadcast" /> */}
            {/* <FontAwesomeIcon icon="fa-thin fa-tower-broadcast" /> */}
            {/* {connectionID && <button onClick={ () => sendData({motion:{x:1, y:2, z:3}}) }>send test message</button> } */}
            {/* <ul>
                {Array.isArray(peer.connections) && peer.connections.map(con => (<li key={con.connectionId}>{con.connectionId}</li>))}
            </ul> */
            <span className='small'>{peer.id}</span>
            /* <ul>
                {dataConnections.map(con => (<li key={con.connectionId}>{con.connectionId}</li>))}
            </ul> */}
        </div>
    )
}

export default ConnectionStatus