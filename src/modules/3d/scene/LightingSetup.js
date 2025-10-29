import * as THREE from "three"
import theme from "../../../style/_vars.scss"

/**
 * LightingSetup - Scene lighting setup (ambient + spotlights)
 * Extracted from VaporwaveScene.js for better modularity
 * Separate from vehicle lights (headlights/taillights)
 */

/**
 * Set up vaporwave lighting (ambient + spotlights)
 * @param {THREE.Scene} scene - The scene to add lights to
 * @param {dat.GUI} gui - Debug GUI folder for light controls
 */
export const setupLights = (scene, gui) => {
	const ambientLight = new THREE.AmbientLight(theme.themeColour1, 16)
	scene.add(ambientLight)
	gui
		.add(ambientLight, "intensity")
		.min(0)
		.max(100)
		.step(0.001)
		.name("AmbientLight intensity")
	gui.addColor(ambientLight, "color").name("AmbientLight color")

	// Spotlight 1
	const spotlight = new THREE.SpotLight(theme.themeColour4, 6, 25, Math.PI * 0.1, 0.25)
	spotlight.position.set(0.5, 0.75, 2.1)
	spotlight.target.position.x = -0.25
	spotlight.target.position.y = 0.25
	spotlight.target.position.z = 0.25
	scene.add(spotlight)
	scene.add(spotlight.target)

	// Spotlight 2
	const spotlight2 = new THREE.SpotLight(theme.themeColour2, 6, 25, Math.PI * 0.1, 0.25)
	spotlight2.position.set(-0.5, 0.75, 2.1)
	spotlight2.target.position.x = 0.25
	spotlight2.target.position.y = 0.25
	spotlight2.target.position.z = 0.25
	scene.add(spotlight2)
	scene.add(spotlight2.target)

	// Debug controls for spotlight 1
	gui
		.add(spotlight, "intensity")
		.min(0)
		.max(50)
		.step(0.001)
		.name("Spotlight 1 intensity")
	gui.addColor(spotlight, "color").name("Spotlight 1 color")
	gui
		.add(spotlight.position, "x")
		.min(-15)
		.max(15)
		.step(0.01)
		.name("Spotlight 1 X")
	gui
		.add(spotlight.position, "y")
		.min(-2)
		.max(15)
		.step(0.01)
		.name("Spotlight 1 Y")
	gui
		.add(spotlight.position, "z")
		.min(-15)
		.max(15)
		.step(0.01)
		.name("Spotlight 1 Z")

	// Debug controls for spotlight 2
	gui
		.add(spotlight2, "intensity")
		.min(0)
		.max(50)
		.step(0.001)
		.name("Spotlight 2 intensity")
	gui.addColor(spotlight2, "color").name("Spotlight 2 color")
	gui
		.add(spotlight2.position, "x")
		.min(-15)
		.max(15)
		.step(0.01)
		.name("Spotlight 2 X")
	gui
		.add(spotlight2.position, "y")
		.min(-2)
		.max(15)
		.step(0.01)
		.name("Spotlight 2 Y")
	gui
		.add(spotlight2.position, "z")
		.min(-15)
		.max(15)
		.step(0.01)
		.name("Spotlight 2 Z")
}

/**
 * Add camera debug controls to GUI
 * @param {dat.GUI} gui - Debug GUI
 * @param {THREE.Camera} camera - Camera to control
 */
export const addCameraDebugControls = (gui, camera) => {
	gui
		.add(camera, "near")
		.min(0)
		.max(10)
		.step(0.1)
		.onChange(() => camera.updateProjectionMatrix())
		.name("Camera Near")
	gui
		.add(camera, "far")
		.min(0)
		.max(100)
		.step(0.1)
		.onChange(() => camera.updateProjectionMatrix())
		.name("Camera Far")
	gui
		.add(camera, "fov")
		.min(0)
		.max(180)
		.step(0.1)
		.onChange(() => camera.updateProjectionMatrix())
		.name("Camera FOV")
	gui
		.add(camera.position, "x")
		.min(0)
		.max(4)
		.step(0.001)
		.onChange(() => camera.updateProjectionMatrix())
		.name("Camera X")
	gui
		.add(camera.position, "y")
		.min(0)
		.max(4)
		.step(0.001)
		.onChange(() => camera.updateProjectionMatrix())
		.name("Camera Y")
}

export default setupLights

