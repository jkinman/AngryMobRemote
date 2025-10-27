import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTowerBroadcast } from '@fortawesome/free-solid-svg-icons'
import './ConnectionStatus.scss'

const ConnectionStatus = React.memo((props) => {
	const { status, peer } = props

	return(
		<div className='connection-status'>
			<h5>RTC status</h5> 
			<p>{status} {status === 'CONNECTED' && <span><FontAwesomeIcon icon={faTowerBroadcast} className="broadcast-icon" /></span>}</p>
			<span className='small'>{peer.id}</span>
		</div>
	)
})

ConnectionStatus.displayName = 'ConnectionStatus'

export default ConnectionStatus