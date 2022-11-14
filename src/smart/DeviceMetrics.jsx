import React, { useEffect, useContext } from "react"

import { DeviceMetricsContext } from "../contexts/DeviceMetricsContext"
import AccelerometerDisplay from "../dumb/AccelerometerDisplay"

let connection

const UplinkComponent = (props) => {
	const deviceState = useContext(DeviceMetricsContext)

	// const fullscreenToggle = () => {
	//   let de = document.documentElement;
	//   if (de.requestFullscreen) { de.requestFullscreen(); }
	//   else if (de.mozRequestFullScreen) { de.mozRequestFullScreen(); }
	//   else if (de.webkitRequestFullscreen) { de.webkitRequestFullscreen(); }
	//   else if (de.msRequestFullscreen) { de.msRequestFullscreen(); }

	//   // (A2) THEN LOCK ORIENTATION
	//   screen.orientation.lock('portrait-primary');
	//    }

	// const fullscreenToggle = () =>{

	//   if( document.body.requestFullscreen ) document.body.requestFullscreen()
	//   if( document.body.webkitRequestFullScreen ) document.body.webkitRequestFullScreen()
	// }
	return (
		<div>
			{deviceState.isMobile ? (
				<div>
					{!deviceState.permissionGranted ? (
						<button onClick={deviceState.enableDeviceOrientationCallback}>
							enable device metrics
						</button>
					) : null}
					{/* <AccelerometerDisplay
						deviceMotion={deviceState.deviceMotion}
						deviceOrientation={deviceState.deviceOrientation}
						permissionStatus={deviceState.permissionStatus}
					/> */}
				</div>
			) : (
				null
			)}
		</div>
	)
}

export default UplinkComponent
