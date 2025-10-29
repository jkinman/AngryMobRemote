import * as THREE from "three"

/**
 * HeadlightManager - Analyzes vehicle models and adds headlights
 */
export class HeadlightManager {
	/**
	 * Traverse a GLTF model and log its structure for inspection
	 * @param {THREE.Object3D} model - The loaded GLTF scene
	 * @param {number} [maxDepth=5] - Maximum depth to traverse
	 */
	static inspectModel(model, maxDepth = 5) {
		console.log("=== Model Structure ===")
		this._traverseAndLog(model, 0, maxDepth)
	}

	/**
	 * Helper to recursively traverse and log the model hierarchy
	 * @private
	 */
	static _traverseAndLog(object, depth, maxDepth) {
		if (depth > maxDepth) return

		const indent = "  ".repeat(depth)
		const info = {
			name: object.name || "(unnamed)",
			type: object.type,
			position: `[${object.position.x.toFixed(2)}, ${object.position.y.toFixed(2)}, ${object.position.z.toFixed(2)}]`,
		}

		console.log(`${indent}${info.name} (${info.type}) at ${info.position}`)

		// Log mesh details
		if (object.type === "Mesh" && object.geometry) {
			const bbox = new THREE.Box3().setFromObject(object)
			const size = new THREE.Vector3()
			bbox.getSize(size)
			console.log(
				`${indent}  └─ size: [${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}]`
			)
		}

		object.children.forEach((child) =>
			this._traverseAndLog(child, depth + 1, maxDepth)
		)
	}

	/**
	 * Find potential headlight positions by analyzing mesh names and positions
	 * @param {THREE.Object3D} model - The loaded GLTF scene
	 * @returns {Array<Object>} Array of headlight data {position, direction, mesh}
	 */
	static findHeadlights(model) {
		const headlights = []
		const headlightKeywords = [
			"light",
			"headlight",
			"lamp",
			"front",
			"beam",
			"glow",
		]

		model.traverse((child) => {
			if (child.isMesh) {
				const name = child.name.toLowerCase()

				// Check if name contains headlight keywords
				const isHeadlight = headlightKeywords.some((keyword) =>
					name.includes(keyword)
				)

				if (isHeadlight) {
					// Get world position
					const worldPos = new THREE.Vector3()
					child.getWorldPosition(worldPos)

					// Get world direction (assuming forward is -Z in model space)
					const worldDir = new THREE.Vector3(0, 0, -1)
					child.getWorldDirection(worldDir)

					headlights.push({
						position: worldPos.clone(),
						direction: worldDir.clone(),
						mesh: child,
						name: child.name,
					})

					console.log(
						`Found headlight: ${child.name} at`,
						worldPos,
						"direction:",
						worldDir
					)
				}
			}
		})

		return headlights
	}

	/**
	 * Manually create headlights based on known vehicle positions
	 * @param {THREE.Object3D} vehicle - The vehicle model
	 * @param {Object} config - Configuration for headlight placement
	 * @returns {Array<THREE.SpotLight>} Array of created lights
	 */
	static createHeadlights(vehicle, config = {}) {
		const defaults = {
			// Headlight positions relative to vehicle center
			leftOffset: new THREE.Vector3(-15, 5, -30),
			rightOffset: new THREE.Vector3(15, 5, -30),
			// Light properties
			color: 0xffffee,
			intensity: 200,
			distance: 100,
			angle: Math.PI / 6, // 30 degrees
			penumbra: 0.3,
			decay: 2,
			// Direction
			targetDistance: 50, // How far ahead the light points
			castShadow: true,
		}

		const settings = { ...defaults, ...config }
		const lights = []

		// Get vehicle's world position and rotation
		const vehicleWorldPos = new THREE.Vector3()
		vehicle.getWorldPosition(vehicleWorldPos)

		const vehicleWorldQuat = new THREE.Quaternion()
		vehicle.getWorldQuaternion(vehicleWorldQuat)

		// Create left headlight
		const leftLight = this._createSpotlight(
			vehicle,
			settings.leftOffset,
			settings,
			"left"
		)
		lights.push(leftLight)

		// Create right headlight
		const rightLight = this._createSpotlight(
			vehicle,
			settings.rightOffset,
			settings,
			"right"
		)
		lights.push(rightLight)

		console.log(`Created ${lights.length} headlights for vehicle`)

		return lights
	}

	/**
	 * Create a single spotlight
	 * @private
	 */
	static _createSpotlight(vehicle, offset, settings, side) {
		// Create spotlight
		const spotlight = new THREE.SpotLight(
			settings.color,
			settings.intensity,
			settings.distance,
			settings.angle,
			settings.penumbra,
			settings.decay
		)

		// Position relative to vehicle
		spotlight.position.copy(offset)
		vehicle.add(spotlight) // Parent to vehicle so it moves with it

		// Create target for spotlight direction
		const target = new THREE.Object3D()
		target.position.copy(offset)
		target.position.z -= settings.targetDistance // Point forward
		vehicle.add(target)
		spotlight.target = target

		// Shadow settings
		if (settings.castShadow) {
			spotlight.castShadow = true
			spotlight.shadow.camera.near = 1
			spotlight.shadow.camera.far = settings.distance
			spotlight.shadow.camera.fov = (settings.angle * 180) / Math.PI
			spotlight.shadow.mapSize.width = 1024
			spotlight.shadow.mapSize.height = 1024
		}

		spotlight.name = `headlight_${side}`

		return spotlight
	}

	/**
	 * Add debug helpers to visualize lights
	 * @param {THREE.Scene} scene - The scene
	 * @param {Array<THREE.SpotLight>} lights - Array of lights
	 * @returns {Array<THREE.SpotLightHelper>} Array of helpers
	 */
	static addLightHelpers(scene, lights) {
		const helpers = []

		lights.forEach((light) => {
			const helper = new THREE.SpotLightHelper(light)
			scene.add(helper)
			helpers.push(helper)
		})

		console.log(`Added ${helpers.length} light helpers`)
		return helpers
	}

	/**
	 * Add GUI controls for headlights
	 * @param {Object} gui - lil-gui instance or folder
	 * @param {Array<THREE.SpotLight>} lights - Array of lights
	 * @param {THREE.Scene} scene - The scene (for adding/removing helpers)
	 * @param {Array} helpersArray - Reference to the helpers array to modify
	 * @returns {Object} The toggle controller for remote control
	 */
	static addGUIControls(gui, lights, scene, helpersArray) {
		const folder = gui.addFolder("Headlights")

		if (lights.length === 0) return null

		// Use first light as reference for shared settings
		const light = lights[0]

		const settings = {
			enabled: true,
			showHelpers: false,
			intensity: light.intensity,
			distance: light.distance,
			angle: (light.angle * 180) / Math.PI,
			penumbra: light.penumbra,
			color: `#${light.color.getHexString()}`,
		}

		// Store reference to toggle controller for remote control
		const toggleController = folder
			.add(settings, "enabled")
			.name("Headlights On")
			.onChange((value) => {
				lights.forEach((l) => (l.visible = value))
			})

		folder
			.add(settings, "showHelpers")
			.name("Show Helpers")
			.onChange((value) => {
				if (value) {
					// Create and add helpers
					if (helpersArray.length === 0) {
						lights.forEach((light) => {
							const helper = new THREE.SpotLightHelper(light)
							scene.add(helper)
							helpersArray.push(helper)
						})
					} else {
						// Show existing helpers
						helpersArray.forEach((helper) => {
							helper.visible = true
							scene.add(helper)
						})
					}
				} else {
					// Hide helpers
					helpersArray.forEach((helper) => {
						helper.visible = false
					})
				}
			})

		folder
			.add(settings, "intensity", 0, 500, 10)
			.name("Intensity")
			.onChange((value) => {
				lights.forEach((l) => (l.intensity = value))
			})

		folder
			.add(settings, "distance", 10, 200, 5)
			.name("Distance")
			.onChange((value) => {
				lights.forEach((l) => (l.distance = value))
			})

		folder
			.add(settings, "angle", 5, 90, 1)
			.name("Angle (deg)")
			.onChange((value) => {
				const radians = (value * Math.PI) / 180
				lights.forEach((l) => (l.angle = radians))
			})

		folder
			.add(settings, "penumbra", 0, 1, 0.1)
			.name("Penumbra")
			.onChange((value) => {
				lights.forEach((l) => (l.penumbra = value))
			})

		folder.addColor(settings, "color").name("Color").onChange((value) => {
			lights.forEach((l) => l.color.setStyle(value))
		})

		folder.close()

		return toggleController
	}
}

export default HeadlightManager

