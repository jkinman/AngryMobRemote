import React, { useEffect, useContext } from 'react'
import './ConnectionStatus.scss'

const ConnectionStatus = (props) => {

    const {data, sendData, status, connection, peer, connectionID, dataConnections} = props

    return(
        <div className='connection-status'>
            <h5>RTC status</h5> 
            <p>{status}</p>
            {/* {connectionID && <button onClick={ () => sendData({motion:{x:1, y:2, z:3}}) }>send test message</button> } */}
            {/* <ul>
                {Array.isArray(peer.connections) && peer.connections.map(con => (<li key={con.connectionId}>{con.connectionId}</li>))}
            </ul> */}
            <span className='small'>{peer.id}</span>
            {/* <ul>
                {dataConnections.map(con => (<li key={con.connectionId}>{con.connectionId}</li>))}
            </ul> */}
        </div>
    )
}

export default ConnectionStatus