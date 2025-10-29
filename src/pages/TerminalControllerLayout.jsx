import React from "react"
import "./TerminalControllerLayout.scss"

export const TerminalControllerLayout = (props) => {
	const { children, connectionStatus, deviceId, onDisconnect, headlightsOn, taillightsOn, onToggleHeadlights, onToggleTaillights } = props

	const handleDisconnect = () => {
		if (window.confirm('Disconnect from main display?')) {
			window.location.href = window.location.origin
		}
	}

	return (
		<div className="terminal-controller">
			<div className="terminal-container">
				<div className="terminal-header">
					<span className="blink">█</span> REMOTE CONTROLLER INITIALIZED
				</div>
				
				<div className="terminal-status">
					<div className="status-line">
						&gt; DEVICE ID: <span className="cyan">{deviceId || "PENDING..."}</span>
					</div>
					<div className="status-line">
						&gt; STATUS: <span className={connectionStatus === "CONNECTED" ? "green" : "yellow"}>
							[{connectionStatus || "CONNECTING"}]
						</span>
					</div>
				</div>

			{/* Light Controls */}
			<div className="light-controls">
				<button 
					className={`light-toggle ${headlightsOn ? 'active' : 'inactive'}`}
					onClick={onToggleHeadlights}
				>
					💡 {headlightsOn ? 'ON' : 'OFF'}
				</button>
				<button 
					className={`light-toggle ${taillightsOn ? 'active' : 'inactive'}`}
					onClick={onToggleTaillights}
				>
					🔴 {taillightsOn ? 'ON' : 'OFF'}
				</button>
			</div>

				<div className="terminal-content">
					{children}
				</div>

				<div className="terminal-actions">
					<button className="disconnect-button" onClick={onDisconnect || handleDisconnect}>
						&gt; DISCONNECT [ESC]
					</button>
				</div>

				<div className="terminal-footer">
					<span className="prompt">&gt;</span> <span className="blink">_</span>
				</div>
			</div>
		</div>
	)
}

export default TerminalControllerLayout

