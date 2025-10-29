import * as THREE from "three"
import * as AssetLoader from "../AssetLoaders"

/**
 * VehicleManager - Handles vehicle loading and light management
 * Extracted from SceneBase.js for better modularity
 */
export class VehicleManager {
	constructor(scene) {
		this.scene = scene
		this.car = null
		this.headlights = []
		this.taillights = []
		this.lightHelpers = []
		this.taillightHelpers = []
		
		// Pending light states (applied after assets load)
		this.pendingLightStates = {
			headlights: true,
			taillights: true
		}
	}

	/**
	 * Load the vehicle and create its lights
	 * @returns {Promise<Object>} Promise resolving to { car, headlights, taillights }
	 */
	async loadVehicle() {
		try {
			const car = await AssetLoader.loadScifiVehicle()
			car.scale.set(0.01, 0.01, 0.01)
			car.rotateY(Math.PI)
			this.scene.add(car)
			this.car = car

			// Create headlights and taillights
			this.createHeadlights()
			this.createTaillights()

			// Apply any pending light states
			console.log('Assets loaded, applying pending light states:', this.pendingLightStates)
			if (this.pendingLightStates) {
				this.applyLightStates(this.pendingLightStates.headlights, this.pendingLightStates.taillights)
			}

			return {
				car: this.car,
				headlights: this.headlights,
				taillights: this.taillights
			}
		} catch (error) {
			console.error("Failed to load vehicle:", error)
			throw error
		}
	}

	/**
	 * Create headlights for the vehicle
	 * @private
	 */
	createHeadlights() {
		// Create headlights using WORLD space coordinates directly
		// Car bounding box: front at z=-0.041 (Min.z), left at x=-0.014, right at x=0.014
		const headlightConfig = {
			// Positions in WORLD space
			leftPosition: new THREE.Vector3(-0.010, 0.010, -0.041),   // Left front corner
			rightPosition: new THREE.Vector3(0.010, 0.010, -0.041),   // Right front corner
			color: 0x545454, // Gray
			intensity: 8,
			distance: 10,
			angle: (10 * Math.PI) / 180, // 10 degrees
			penumbra: 0.05,
			castShadow: false,
			targetDistance: -20, // Point forward (negative Z direction)
		}

		// Left headlight
		const leftLight = new THREE.SpotLight(
			headlightConfig.color,
			headlightConfig.intensity,
			headlightConfig.distance,
			headlightConfig.angle,
			headlightConfig.penumbra,
			2 // decay
		)
		leftLight.position.copy(headlightConfig.leftPosition)
		leftLight.name = "headlight_left"
		
		// Target points forward in world space
		const leftTarget = new THREE.Object3D()
		leftTarget.position.set(
			headlightConfig.leftPosition.x, 
			headlightConfig.leftPosition.y, 
			headlightConfig.leftPosition.z + headlightConfig.targetDistance
		)
		this.scene.add(leftTarget)
		leftLight.target = leftTarget
		this.scene.add(leftLight) // Add to scene, not car
		this.headlights.push(leftLight)

		// Right headlight
		const rightLight = new THREE.SpotLight(
			headlightConfig.color,
			headlightConfig.intensity,
			headlightConfig.distance,
			headlightConfig.angle,
			headlightConfig.penumbra,
			2 // decay
		)
		rightLight.position.copy(headlightConfig.rightPosition)
		rightLight.name = "headlight_right"
		
		// Target points forward in world space
		const rightTarget = new THREE.Object3D()
		rightTarget.position.set(
			headlightConfig.rightPosition.x, 
			headlightConfig.rightPosition.y, 
			headlightConfig.rightPosition.z + headlightConfig.targetDistance
		)
		this.scene.add(rightTarget)
		rightLight.target = rightTarget
		this.scene.add(rightLight) // Add to scene, not car
		this.headlights.push(rightLight)
	}

	/**
	 * Create tail lights for the vehicle
	 * @private
	 */
	createTaillights() {
		// Create tail lights (red spotlights pointing backward at the rear)
		// Rear of car is at z=0.025 (Max.z)

		// Left tail light - SpotLight pointing backward
		const leftTailLight = new THREE.SpotLight(
			0xff0000,  // Red
			0.5,       // Intensity
			0.5,       // Distance
			(70 * Math.PI) / 180, // 70 degree angle
			1,         // Penumbra
			2          // Decay
		)
		leftTailLight.position.set(-0.010, 0.008, 0.025) // Left rear corner
		leftTailLight.name = "taillight_left"
		
		// Target points backward (positive Z direction)
		const leftTailTarget = new THREE.Object3D()
		leftTailTarget.position.set(-0.010, 0.008, 5) // Point backward
		this.scene.add(leftTailTarget)
		leftTailLight.target = leftTailTarget
		this.scene.add(leftTailLight)
		this.taillights.push(leftTailLight)

		// Right tail light - SpotLight pointing backward
		const rightTailLight = new THREE.SpotLight(
			0xff0000,  // Red
			0.5,       // Intensity
			0.5,       // Distance
			(70 * Math.PI) / 180, // 70 degree angle
			1,         // Penumbra
			2          // Decay
		)
		rightTailLight.position.set(0.010, 0.008, 0.025) // Right rear corner
		rightTailLight.name = "taillight_right"
		
		// Target points backward (positive Z direction)
		const rightTailTarget = new THREE.Object3D()
		rightTailTarget.position.set(0.010, 0.008, 5) // Point backward
		this.scene.add(rightTailTarget)
		rightTailLight.target = rightTailTarget
		this.scene.add(rightTailLight)
		this.taillights.push(rightTailLight)
	}

	/**
	 * Set headlight and taillight visibility (remote control)
	 * Queues state if assets aren't loaded yet
	 * @param {boolean} headlightsOn - Whether headlights should be on
	 * @param {boolean} taillightsOn - Whether taillights should be on
	 */
	setLightStates(headlightsOn, taillightsOn) {
		console.log('setLightStates called:', { headlightsOn, taillightsOn })
		console.log('Has headlights array?', !!this.headlights, 'Length:', this.headlights?.length)
		console.log('Has taillights array?', !!this.taillights, 'Length:', this.taillights?.length)
		
		// Store pending states
		if (headlightsOn !== undefined) {
			this.pendingLightStates.headlights = headlightsOn
		}
		if (taillightsOn !== undefined) {
			this.pendingLightStates.taillights = taillightsOn
		}
		
		// If assets are loaded, apply immediately
		if (this.headlights.length > 0 || this.taillights.length > 0) {
			console.log('Assets loaded, applying immediately')
			this.applyLightStates(headlightsOn, taillightsOn)
		} else {
			console.log('Assets not loaded yet, states queued:', this.pendingLightStates)
		}
	}
	
	/**
	 * Apply light states directly (internal method)
	 * @param {boolean} headlightsOn - Whether headlights should be on
	 * @param {boolean} taillightsOn - Whether taillights should be on
	 * @param {Object} headlightController - Optional GUI controller for headlights
	 * @param {Object} taillightController - Optional GUI controller for taillights
	 * @private
	 */
	applyLightStates(headlightsOn, taillightsOn, headlightController = null, taillightController = null) {
		console.log('applyLightStates called:', { headlightsOn, taillightsOn })
		
		// Update headlights
		if (headlightsOn !== undefined) {
			console.log('Processing headlights, value:', headlightsOn)
			if (headlightController) {
				// Use GUI controller to keep everything in sync
				console.log('Setting headlight via controller to:', headlightsOn)
				headlightController.setValue(headlightsOn)
			} else if (this.headlights.length > 0) {
				// Fallback: directly set visibility if controller not ready yet
				console.log('Setting headlight directly to:', headlightsOn, 'on', this.headlights.length, 'lights')
				this.headlights.forEach((l) => {
					console.log('Setting light visible:', l.name, 'to', headlightsOn)
					l.visible = headlightsOn
				})
			}
		}
		
		// Update taillights
		if (taillightsOn !== undefined) {
			console.log('Processing taillights, value:', taillightsOn)
			if (taillightController) {
				// Use GUI controller to keep everything in sync
				console.log('Setting taillight via controller to:', taillightsOn)
				taillightController.setValue(taillightsOn)
			} else if (this.taillights.length > 0) {
				// Fallback: directly set visibility if controller not ready yet
				console.log('Setting taillight directly to:', taillightsOn, 'on', this.taillights.length, 'lights')
				this.taillights.forEach((l) => {
					console.log('Setting light visible:', l.name, 'to', taillightsOn)
					l.visible = taillightsOn
				})
			}
		}
		
		console.log('applyLightStates complete')
	}

	/**
	 * Update light helpers if they exist and are visible
	 */
	updateHelpers() {
		if (this.lightHelpers && this.lightHelpers.length > 0) {
			this.lightHelpers.forEach(helper => {
				if (helper.visible) {
					helper.update()
				}
			})
		}

		if (this.taillightHelpers && this.taillightHelpers.length > 0) {
			this.taillightHelpers.forEach(helper => {
				if (helper.visible) {
					helper.update()
				}
			})
		}
	}
}

export default VehicleManager

