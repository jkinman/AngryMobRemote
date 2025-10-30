import { useEffect } from "react"
import { useRTC, useApp } from "../hooks"

/**
 * StateBroadcaster - Broadcasts AppState changes from client to all connected remotes
 * This is the client-side counterpart to UplinkComponent (which runs on remote)
 * 
 * When GUI controls on the client change state (headlights, taillights, modals),
 * this component detects those changes and broadcasts them to all connected remotes
 */
const StateBroadcaster = () => {
	const RTCState = useRTC()
	const AppState = useApp()
	
	useEffect(() => {
		console.log('StateBroadcaster: State change detected', {
			dataConnectionsSize: RTCState.dataConnections?.size,
			peerConnection: RTCState.peerConnection,
			headlightsOn: AppState.headlightsOn,
			taillightsOn: AppState.taillightsOn,
		})
		
		// Only broadcast if we have connected peers
		if (RTCState.dataConnections?.size > 0) {
			console.log('StateBroadcaster: Broadcasting state update:', {
				showAbout: AppState.showAbout, 
				showCV: AppState.showCV,
				headlightsOn: AppState.headlightsOn,
				taillightsOn: AppState.taillightsOn,
			})
			
			RTCState.broadcastState({
				state: { 
					showAbout: AppState.showAbout, 
					showCV: AppState.showCV,
					headlightsOn: AppState.headlightsOn,
					taillightsOn: AppState.taillightsOn,
				},
			})
		} else {
			console.log('StateBroadcaster: No connections to broadcast to')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [AppState.showAbout, AppState.showCV, AppState.headlightsOn, AppState.taillightsOn])

	// This component doesn't render anything
	return null
}

export default StateBroadcaster

