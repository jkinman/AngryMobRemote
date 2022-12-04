import React, { useEffect, useContext } from "react"

import { DeviceMetricsContext } from "../contexts/DeviceMetricsContext"
import AccelerometerDisplay from "../dumb/AccelerometerDisplay"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faVideo } from "@fortawesome/free-solid-svg-icons"

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
					<h5>Remote Uplink</h5>
					{!deviceState.permissionGranted ? (
						<div
							style={{
								margin: "1",
								display: "flex",
								flexDirection: "column",
							}}
						>
							{/* <FontAwesomeIcon icon={faVideo} onClick={deviceState.enableDeviceOrientationCallback} /> */}
							{!deviceState.permissionStatus && (
								<>
								<h1>You need to allow the site to access your accelerometor by clicking the button below and selecting allow</h1>
								<button
									className='cyberpunk2077 purple'
									onClick={deviceState.enableDeviceOrientationCallback}
								>
									enable device metrics
								</button>
								</>
							)}
						</div>
					) : null}
					{/* <AccelerometerDisplay
						deviceMotion={deviceState.deviceMotion}
						deviceOrientation={deviceState.deviceOrientation}
						permissionStatus={deviceState.permissionStatus}
					/> */}
				</div>
			) : null}
		</div>
	)
}

export default UplinkComponent
