import React, { useEffect, useContext } from "react"

import { DeviceMetricsContext } from "../contexts/DeviceMetricsContext"
import AccelerometerDisplay from "../dumb/AccelerometerDisplay"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faVideo } from "@fortawesome/free-solid-svg-icons"

const DeviceMetrics = (props) => {
	const deviceState = useContext(DeviceMetricsContext)

	return (
		<div>
			{deviceState.isMobile ? (
				<div>
					{!deviceState.permissionGranted ? (
						<div
						style={{
							margin: "1",
							display: "flex",
							flexDirection: "column",
						}}
						>
							{deviceState.needsPermission ? (
								<>
									<p>You need to allow the site to access your accelerometer by clicking the button below and selecting allow</p>
									<button
										className='cyberpunk2077 purple'
										onClick={deviceState.enableDeviceOrientationCallback}
									>
										enable device metrics
									</button>
								</>
							) : (
								<p>Connecting device sensors...</p>
							)}
						</div>
					) : (
						<div style={{ margin: "1em" }}>
							<p style={{ color: "green" }}>✓ Device sensors connected</p>
							<AccelerometerDisplay
								deviceMotion={deviceState.deviceMotion}
								deviceOrientation={deviceState.deviceOrientation}
								permissionStatus={deviceState.permissionStatus}
							/>
						</div>
					)}
				</div>
			) : (
				<p>This feature requires a mobile device with motion sensors.</p>
			)}
		</div>
	)
}

export default DeviceMetrics
