import React from 'react'

const AccelerometerDisplay = React.memo((props) => {
	const {deviceMotion, deviceOrientation, permissionStatus} = props

	return(
		<div>
			<h1>Permission</h1>
			<p>{JSON.stringify(permissionStatus)}</p>
			<h1>Motion</h1> 
			<p>x: {deviceMotion.x?.toFixed(2) || '0.00'}</p>
			<p>y: {deviceMotion.y?.toFixed(2) || '0.00'}</p>
			<p>z: {deviceMotion.z?.toFixed(2) || '0.00'}</p>
			<h1>Orientation</h1> 
			<p>alpha: {deviceOrientation.alpha?.toFixed(2) || '0.00'}</p>
			<p>beta: {deviceOrientation.beta?.toFixed(2) || '0.00'}</p>
			<p>gamma: {deviceOrientation.gamma?.toFixed(2) || '0.00'}</p>
		</div>
	)
})

AccelerometerDisplay.displayName = 'AccelerometerDisplay'

export default AccelerometerDisplay