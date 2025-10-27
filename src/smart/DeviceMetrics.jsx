import React from "react"
import { useDeviceMetrics } from "../hooks"
import AccelerometerDisplay from "../dumb/AccelerometerDisplay"

const DeviceMetrics = (props) => {
	const deviceState = useDeviceMetrics()

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
