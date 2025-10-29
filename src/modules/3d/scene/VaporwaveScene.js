import * as THREE from "three"
import { PostProcessingManager } from "../effects/PostProcessingManager"

/**
 * VaporwaveScene - Main scene configuration
 * Refactored to use modular components
 */

// Re-export terrain creation for backward compatibility
export { createTerrain } from "./TerrainFactory"

// Re-export lighting setup for backward compatibility  
export { setupLights, addCameraDebugControls } from "./LightingSetup"

/**
 * Set up post-processing effects for vaporwave aesthetic
 * @param {dat.GUI} gui - Debug GUI for post-processing controls
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @param {THREE.Camera} camera - The scene camera
 * @param {THREE.Scene} scene - The scene to render
 * @returns {Object} { effectComposer, asciiEffect, effectsConfig }
 */
export const createPostProcessing = (gui, renderer, camera, scene) => {
	const manager = new PostProcessingManager(gui, renderer, camera, scene)
	return manager.initialize()
}

/**
 * Create a sun sphere (legacy - kept for future use)
 * @returns {THREE.Mesh} Sun sphere mesh
 */
export const createSun = () => {
	const geometry = new THREE.SphereGeometry(250, 4, 4)
	const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
	const sphere = new THREE.Mesh(geometry, material)
	sphere.position.set(0, 0, -1000)
	return sphere
}
