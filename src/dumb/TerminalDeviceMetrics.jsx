import React from 'react'
import './TerminalDeviceMetrics.scss'

const TerminalDeviceMetrics = (props) => {
	const { deviceState } = props

	if (!deviceState.isMobile) {
		return (
			<div className="terminal-error">
				<div className="error-box">
					<div className="error-header">⚠ ERROR: INVALID DEVICE</div>
					<div className="error-message">
						This controller requires a mobile device with motion sensors.
					</div>
				</div>
			</div>
		)
	}

	if (!deviceState.permissionGranted) {
		return (
			<div className="terminal-permission">
				<div className="permission-box">
					<div className="permission-header glitch">
						⚠ ACTION REQUIRED ⚠
					</div>
					<div className="permission-message">
						<p>SYSTEM REQUIRES SENSOR ACCESS</p>
						<p className="sub-message">
							Grant device orientation and motion permissions to establish
							gyroscopic camera control link.
						</p>
					</div>
					<button
						className="terminal-button"
						onClick={deviceState.enableDeviceOrientationCallback}
					>
						&gt; GRANT ACCESS_
					</button>
					{deviceState.needsPermission && (
						<div className="permission-note">
							<small>&gt; Browser will prompt for permission</small>
						</div>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="terminal-sensors">
			<div className="sensor-status">
				<span className="green">✓ SENSORS ONLINE</span>
			</div>
			
			<div className="sensor-data">
				<div className="data-section">
					<div className="section-title">&gt; ORIENTATION DATA:</div>
					<div className="data-line">
						<span className="data-label">ALPHA:</span>
						<span className="data-value cyan">
							{deviceState.deviceOrientation.alpha?.toFixed(2) || '0.00'}°
						</span>
					</div>
					<div className="data-line">
						<span className="data-label">BETA:</span>
						<span className="data-value cyan">
							{deviceState.deviceOrientation.beta?.toFixed(2) || '0.00'}°
						</span>
					</div>
					<div className="data-line">
						<span className="data-label">GAMMA:</span>
						<span className="data-value cyan">
							{deviceState.deviceOrientation.gamma?.toFixed(2) || '0.00'}°
						</span>
					</div>
				</div>

				<div className="data-section">
					<div className="section-title">&gt; MOTION DATA:</div>
					<div className="data-line">
						<span className="data-label">X:</span>
						<span className="data-value cyan">
							{deviceState.deviceMotion.x?.toFixed(3) || '0.000'}
						</span>
					</div>
					<div className="data-line">
						<span className="data-label">Y:</span>
						<span className="data-value cyan">
							{deviceState.deviceMotion.y?.toFixed(3) || '0.000'}
						</span>
					</div>
					<div className="data-line">
						<span className="data-label">Z:</span>
						<span className="data-value cyan">
							{deviceState.deviceMotion.z?.toFixed(3) || '0.000'}
						</span>
					</div>
				</div>
			</div>

			<div className="streaming-indicator">
				<span className="blink">█</span> STREAMING TO MAIN DISPLAY
			</div>
		</div>
	)
}

export default TerminalDeviceMetrics

