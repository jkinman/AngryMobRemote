import * as THREE from "three"
import * as CameraTools from "../DeviceCameraTools"
import theme from "../../style/_vars.scss"

import { WebGLRendererWrapper } from "./core/Renderer"
import { CameraController } from "./core/Camera"
import { DebugTools } from "./utils/DebugTools"
import { HeadlightManager } from "./utils/HeadlightManager"
import * as AssetLoader from "./AssetLoaders"
import * as VaporwaveScene from "./scene/VaporwaveScene"

/**
 * Main 3D scene controller
 * Orchestrates renderer, camera, scene setup, and animation loop
 */
class SceneBase {
	/**
	 * Create a new scene
	 * @param {Object} props - Scene configuration
	 * @param {boolean} [props.showControls=true] - Whether to show debug controls
	 */
	constructor(props = {}) {
		this.mounted = false
		this.clock = new THREE.Clock()
		this.data = {}
		this.showControls = props.showControls !== undefined ? props.showControls : true
		
		// Pending light states (applied after assets load)
		this.pendingLightStates = {
			headlights: true,
			taillights: true
		}
	}

	/**
	 * Initialize and start the scene
	 * @async
	 */
	async startUp() {
		if (this.mounted) {
			console.error("Scene already mounted")
			return
		}

		this.mounted = true

		// Initialize core systems
		this.initializeDebugTools()
		this.initializeScene()
		this.initializeRenderer()
		this.initializeCamera()

		// Load assets
		await this.loadAssets()

		// Setup scene content
		this.setupVaporwaveScene()
		this.setupPostProcessing()

		// Start render loop
		this.bindEvents()
		this.renderLoop()
	}

	/**
	 * Initialize debug tools (FPS counter and GUI)
	 * @private
	 */
	initializeDebugTools() {
		this.debug = new DebugTools(this.showControls)
	}

	/**
	 * Initialize the Three.js scene and skybox
	 * @private
	 */
	initializeScene() {
		this.scene = new THREE.Scene()
		this.scene.fog = new THREE.Fog(theme.themeColour5, 0.6, 1.6)
		this.setupSkybox()
	}

	/**
	 * Set up the skybox with cube texture
	 * @private
	 */
	setupSkybox() {
		const loader = new THREE.CubeTextureLoader()
		loader.setPath("textures/images/")

		const textureCube = loader.load([
			"px.png",
			"nx.png",
			"py.png",
			"ny.png",
			"pz.png",
			"nz.png",
		])
		textureCube.generateMipmaps = false
		textureCube.wrapS = textureCube.wrapT = THREE.ClampToEdgeWrapping
		textureCube.minFilter = THREE.LinearFilter
		textureCube.colorSpace = THREE.SRGBColorSpace
		this.scene.background = textureCube
	}

	/**
	 * Initialize WebGL renderer and attach to DOM
	 * @private
	 */
	initializeRenderer() {
		this.webglRenderer = new WebGLRendererWrapper()
		const el = document.getElementById("threed-canvas")
		document.body.appendChild(el)
		el.className = "threed-canvas"
		el.appendChild(this.webglRenderer.domElement)
	}

	/**
	 * Initialize camera and orbit controls
	 * @private
	 */
	initializeCamera() {
		this.cameraController = new CameraController(this.webglRenderer.instance)
	}

	/**
	 * Load 3D assets (models, textures, etc.)
	 * @async
	 * @private
	 */
	async loadAssets() {
		try {
			const car = await AssetLoader.loadScifiVehicle()
			car.scale.set(0.01, 0.01, 0.01)
			car.rotateY(Math.PI)
			this.scene.add(car)
			this.car = car


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

			// Create lights and add them to the scene (not parented to car)
			this.headlights = []
			
			// Store car reference for manual syncing if needed
			this.carForLights = car
			
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

			// Create tail lights (red spotlights pointing backward at the rear)
			// Rear of car is at z=0.025 (Max.z)
			this.taillights = []

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
			
			// Initialize empty helpers arrays (will be created via GUI)
			this.lightHelpers = []
			this.taillightHelpers = []
			
			// Apply any pending light states
			console.log('Assets loaded, applying pending light states:', this.pendingLightStates)
			if (this.pendingLightStates) {
				this.applyLightStates(this.pendingLightStates.headlights, this.pendingLightStates.taillights)
			}
		} catch (error) {
			console.error("Failed to load assets:", error)
		}
	}

	/**
	 * Set up the vaporwave scene (terrain, lights)
	 * @private
	 */
	setupVaporwaveScene() {
		const terrainGroup = VaporwaveScene.createTerrain(this.debug.addFolder("terrain"))
		this.scene.add(terrainGroup)

		this.plane = this.scene.getObjectByName("vaporWaveGround1")
		this.plane2 = this.scene.getObjectByName("vaporWaveGround2")

		VaporwaveScene.setupLights(this.scene, this.debug.addFolder("lights"))
	}

	/**
	 * Set up post-processing effects
	 * @private
	 */
	setupPostProcessing() {
		this.effectComposer = VaporwaveScene.createPostProcessing(
			this.debug.gui,
			this.webglRenderer.instance,
			this.cameraController.camera,
			this.scene
		)

		VaporwaveScene.addCameraDebugControls(
			this.debug.gui,
			this.cameraController.camera
		)

		// Add headlight controls if headlights exist
		if (this.headlights && this.headlights.length > 0) {
			this.headlightToggleController = HeadlightManager.addGUIControls(
				this.debug.gui, 
				this.headlights, 
				this.scene, 
				this.lightHelpers
			)
		}

		// Add tail light controls if tail lights exist
		if (this.taillights && this.taillights.length > 0) {
			this.addTaillightGUIControls()
		}
	}

	/**
	 * Add GUI controls for tail lights
	 * @private
	 */
	addTaillightGUIControls() {
		const folder = this.debug.gui.addFolder("Tail Lights")

		const light = this.taillights[0]
		const settings = {
			enabled: true,
			showHelpers: false,
			intensity: light.intensity,
			distance: light.distance,
			angle: (light.angle * 180) / Math.PI,
			penumbra: light.penumbra,
			color: `#${light.color.getHexString()}`,
		}

		// Store reference to the toggle controller for remote control
		this.taillightToggleController = folder
			.add(settings, "enabled")
			.name("Tail Lights On")
			.onChange((value) => {
				this.taillights.forEach((l) => (l.visible = value))
			})

		folder
			.add(settings, "showHelpers")
			.name("Show Helpers")
			.onChange((value) => {
				if (value) {
					// Create and add helpers if they don't exist
					if (this.taillightHelpers.length === 0) {
						this.taillights.forEach((light) => {
							const helper = new THREE.SpotLightHelper(light)
							this.scene.add(helper)
							this.taillightHelpers.push(helper)
						})
					} else {
						// Show existing helpers
						this.taillightHelpers.forEach((helper) => {
							helper.visible = true
						})
					}
				} else {
					// Hide helpers
					this.taillightHelpers.forEach((helper) => {
						helper.visible = false
					})
				}
			})

		folder
			.add(settings, "intensity", 0, 10, 0.5)
			.name("Intensity")
			.onChange((value) => {
				this.taillights.forEach((l) => (l.intensity = value))
			})

		folder
			.add(settings, "distance", 0.5, 10, 0.5)
			.name("Distance")
			.onChange((value) => {
				this.taillights.forEach((l) => (l.distance = value))
			})

		folder
			.add(settings, "angle", 10, 180, 5)
			.name("Angle (deg)")
			.onChange((value) => {
				const radians = (value * Math.PI) / 180
				this.taillights.forEach((l) => (l.angle = radians))
			})

		folder
			.add(settings, "penumbra", 0, 1, 0.1)
			.name("Penumbra")
			.onChange((value) => {
				this.taillights.forEach((l) => (l.penumbra = value))
			})

		folder
			.addColor(settings, "color")
			.name("Color")
			.onChange((value) => {
				this.taillights.forEach((l) => l.color.setStyle(value))
			})

		folder.close()
	}

	/**
	 * Bind window event listeners
	 * @private
	 */
	bindEvents() {
		window.addEventListener("resize", () => this.resize(), false)
	}

	/**
	 * Main render loop (called every frame)
	 * @private
	 */
	renderLoop() {
		this.debug.begin()

		const elapsedTime = this.clock.getElapsedTime()
		const deltaTime = this.clock.getDelta()

		// Update animated elements
		this.updateAnimations(elapsedTime)

		// Update camera from device data or orbit controls
		this.updateCamera(deltaTime)

		// Render
		if (this.effectComposer) {
			this.effectComposer.render()
		} else {
			this.webglRenderer.render(this.scene, this.cameraController.camera)
		}

		this.debug.end()
		requestAnimationFrame(() => this.renderLoop())
	}

	/**
	 * Update animated scene elements
	 * @param {number} elapsedTime - Time elapsed since scene start
	 * @private
	 */
	updateAnimations(elapsedTime) {
		// Animate terrain planes for infinite scrolling effect
		if (this.plane && this.plane2) {
			this.plane.position.z = (elapsedTime * 0.15) % 2
			this.plane2.position.z = ((elapsedTime * 0.15) % 2) - 2
		}

		// Update light helpers if they exist and are visible
		if (this.lightHelpers && this.lightHelpers.length > 0) {
			this.lightHelpers.forEach(helper => {
				if (helper.visible) {
					helper.update()
				}
			})
		}

		// Update tail light helpers if they exist and are visible
		if (this.taillightHelpers && this.taillightHelpers.length > 0) {
			this.taillightHelpers.forEach(helper => {
				if (helper.visible) {
					helper.update()
				}
			})
		}
	}

	/**
	 * Update camera based on device orientation or orbit controls
	 * @private
	 */
	updateCamera(deltaTime) {
		if (this.data?.beta) {
			// Device orientation control
			this.cameraController.enableAutoRotate(false)
			CameraTools.cameraRotate(this.data, this.cameraController.camera)
			// Uncomment to rotate other objects:
			// if (this.d20) CameraTools.cameraRotate(this.data, this.d20)
			// if (this.mobile) CameraTools.cameraRotate(this.data, this.mobile)
			// if (this.car) CameraTools.cameraRotate(this.data, this.car)
		} else {
			// Orbit controls
			this.cameraController.enableAutoRotate(true)
			this.cameraController.update()
		}
	}

	/**
	 * Update device motion/orientation data
	 * @param {Object} data - Device data containing alpha, beta, gamma
	 */
	updateData(data) {
		this.data = data
	}

	/**
	 * Show or hide debug controls
	 * @param {boolean} show - Whether to show controls
	 */
	setShowControls(show) {
		this.showControls = show
		if (this.debug) {
			this.debug.setVisible(show)
		}
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
		if (this.headlights || this.taillights) {
			console.log('Assets loaded, applying immediately')
			this.applyLightStates(headlightsOn, taillightsOn)
		} else {
			console.log('Assets not loaded yet, states queued:', this.pendingLightStates)
		}
	}
	
	/**
	 * Apply light states directly (internal method)
	 * @private
	 */
	applyLightStates(headlightsOn, taillightsOn) {
		console.log('applyLightStates called:', { headlightsOn, taillightsOn })
		
		// Update headlights
		if (headlightsOn !== undefined) {
			console.log('Processing headlights, value:', headlightsOn)
			if (this.headlightToggleController) {
				// Use GUI controller to keep everything in sync
				console.log('Setting headlight via controller to:', headlightsOn)
				this.headlightToggleController.setValue(headlightsOn)
			} else if (this.headlights) {
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
			if (this.taillightToggleController) {
				// Use GUI controller to keep everything in sync
				console.log('Setting taillight via controller to:', taillightsOn)
				this.taillightToggleController.setValue(taillightsOn)
			} else if (this.taillights) {
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
	 * Handle window resize
	 * @private
	 */
	resize() {
		const width = window.innerWidth
		const height = window.innerHeight

		this.webglRenderer.resize(width, height)
		this.cameraController.resize(width, height)

		if (this.effectComposer) {
			this.effectComposer.setSize(width, height)
			this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		}
	}

	/**
	 * Clean up resources and stop animation
	 */
	dispose() {
		this.mounted = false
		window.removeEventListener("resize", this.resize)
		this.webglRenderer.dispose()
		this.cameraController.dispose()
	}
}

export default SceneBase
