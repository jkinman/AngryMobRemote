import React, { useEffect, useContext } from 'react'

const ConnectionStatus = (props) => {

    const {data, sendData, status, connection, peer, connectionID, dataConnections} = props

    return(
        <div>
            <h2>{ status }</h2>
            <h1>Connection</h1> 
            {connectionID && <button onClick={ () => sendData({motion:{x:1, y:2, z:3}}) }>send test message</button> }
            <h4>open: {connectionID}</h4>
            <h4>type: {connection.type}</h4>
            <ul>
                {Array.isArray(peer.connections) && peer.connections.map(con => (<li key={con.connectionId}>{con.connectionId}</li>))}
            </ul>
            <h1>Peer</h1> 
            <h4>open: {peer.open ? 'open' : 'closed'}</h4>
            <h4>id: {peer.id}</h4>
            <ul>
                {dataConnections.map(con => (<li key={con.connectionId}>{con.connectionId}</li>))}
            </ul>
            {/* <h1>data</h1>
            <p>{JSON.stringify(data)}</p> */}
        </div>
    )
}

export default ConnectionStatus