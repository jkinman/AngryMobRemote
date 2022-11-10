import React, { useEffect, useContext } from 'react'

const ConnectionStatus = (props) => {

    const {connection} = props

    return(
        <div>
            <h1>UplinkComponent</h1> 
            <h4>connected: {connection ? 'yes' : 'no'}</h4>
            <h4>peer: {connection.peer}</h4>
            <h4>label: {connection.label}</h4>
            <h4>serialization: {connection.serialization}</h4>
        </div>
    )
}

export default ConnectionStatus