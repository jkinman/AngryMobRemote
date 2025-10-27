import { useEffect, useRef } from "react"
import SceneBase from "../modules/3d/SceneBase.js"

/**
 * 3D scene renderer component
 * Manages the lifecycle of the Three.js scene
 */
export const Render3d = (props) => {
	const { storeDataCallback, showControls, isClient } = props
	const sceneRef = useRef(null)

	// Initialize scene when client mode is activated (only once)
	useEffect(() => {
		if (!isClient) return

		// Initialize scene
		const scene = new SceneBase({ showControls })
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
	}, [isClient]) // Only depend on isClient, not showControls or storeDataCallback

	// Update controls visibility when it changes
	useEffect(() => {
		if (sceneRef.current && isClient) {
			sceneRef.current.setShowControls(showControls)
		}
	}, [showControls, isClient])

	return null
}

export default Render3d
