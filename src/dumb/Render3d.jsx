import { useEffect, useRef } from "react"
import SceneBase from "../modules/3d/SceneBase.js"

/**
 * 3D scene renderer component
 * Manages the lifecycle of the Three.js scene
 */
export const Render3d = (props) => {
	const { storeDataCallback, showControls, isClient, headlightsOn, taillightsOn, onHeadlightsChange, onTaillightsChange, RTCState } = props
	const sceneRef = useRef(null)
	const prevPeerConnectionRef = useRef(false)

	// Initialize scene when client mode is activated (only once)
	useEffect(() => {
		if (!isClient) return

		// Initialize scene
		const scene = new SceneBase({ 
			showControls,
			onHeadlightsChange,
			onTaillightsChange
		})
		sceneRef.current = scene

		scene.startUp().then(() => {
			storeDataCallback((data) => scene.updateData(data))
		})

		// Cleanup on unmount
		return () => {
			if (sceneRef.current) {
				sceneRef.current.dispose()
				sceneRef.current = null
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isClient]) // Only depend on isClient - callbacks and showControls are set at construction time

	// Reset camera when remote disconnects
	useEffect(() => {
		if (!isClient || !sceneRef.current || !RTCState) return

		const wasConnected = prevPeerConnectionRef.current
		const isConnected = RTCState.peerConnection

		// Detect disconnect: was connected, now not connected
		if (wasConnected && !isConnected) {
			console.log('RTC disconnected - resetting camera to initial state')
			sceneRef.current.resetCamera()
		}

		// Store current connection state for next comparison
		prevPeerConnectionRef.current = isConnected
	}, [isClient, RTCState?.peerConnection, RTCState])

	// Update controls visibility when it changes
	useEffect(() => {
		if (sceneRef.current && isClient) {
			sceneRef.current.setShowControls(showControls)
		}
	}, [showControls, isClient])

	// Update light states when they change
	useEffect(() => {
		console.log('Render3d light effect:', { headlightsOn, taillightsOn, hasScene: !!sceneRef.current, isClient })
		if (sceneRef.current && isClient) {
			sceneRef.current.setLightStates(headlightsOn, taillightsOn)
		}
	}, [headlightsOn, taillightsOn, isClient])

	return null
}

export default Render3d
