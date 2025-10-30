import * as THREE from "three"
import * as CameraTools from "../DeviceCameraTools"
import theme from "../../style/_vars.scss"

import { WebGLRendererWrapper } from "./core/Renderer"
import { CameraController } from "./core/Camera"
import { DebugTools } from "./utils/DebugTools"
import { HeadlightManager } from "./utils/HeadlightManager"
import { VehicleManager } from "./managers/VehicleManager"
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
	 * @param {Function} [props.onHeadlightsChange] - Callback when headlights change
	 * @param {Function} [props.onTaillightsChange] - Callback when taillights change
	 */
	constructor(props = {}) {
		this.mounted = false
		this.clock = new THREE.Clock()
		this.data = {}
		this.showControls = props.showControls !== undefined ? props.showControls : true
		this.vehicleManager = null
		this.onHeadlightsChange = props.onHeadlightsChange
		this.onTaillightsChange = props.onTaillightsChange
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
			// Use VehicleManager to load vehicle and create lights
			this.vehicleManager = new VehicleManager(this.scene)
			const { car, headlights, taillights } = await this.vehicleManager.loadVehicle()
			
			// Store references for backward compatibility
			this.car = car
			this.headlights = headlights
			this.taillights = taillights
			this.lightHelpers = this.vehicleManager.lightHelpers
			this.taillightHelpers = this.vehicleManager.taillightHelpers
		} catch (error) {
			console.error("Failed to load assets:", error)
		}
	}

	/**
	 * Set up the vaporwave scene (terrain, lights)
	 * @private
	 */
	setupVaporwaveScene() {
		const lightsFolder = this.debug.addFolder("Scene Lights")
		VaporwaveScene.setupLights(this.scene, lightsFolder)
		lightsFolder.close()

		const terrainFolder = this.debug.addFolder("Terrain")
		const terrainGroup = VaporwaveScene.createTerrain(terrainFolder)
		terrainFolder.close()
		this.scene.add(terrainGroup)

		this.plane = this.scene.getObjectByName("vaporWaveGround1")
		this.plane2 = this.scene.getObjectByName("vaporWaveGround2")
	}

	/**
	 * Set up post-processing effects and GUI controls
	 * Controls are ordered by priority: vehicle lights → effects → scene → camera → terrain
	 * @private
	 */
	setupPostProcessing() {
		// 1. Add headlight controls first (highest priority)
		if (this.headlights && this.headlights.length > 0) {
			this.headlightToggleController = HeadlightManager.addGUIControls(
				this.debug.gui, 
				this.headlights, 
				this.scene, 
				this.lightHelpers,
				this.onHeadlightsChange
			)
		}

		// 2. Add tail light controls second
		if (this.taillights && this.taillights.length > 0) {
			this.addTaillightGUIControls()
		}

		// 3. Add post-processing effects third
		const postProcessing = VaporwaveScene.createPostProcessing(
			this.debug.gui,
			this.webglRenderer.instance,
			this.cameraController.camera,
			this.scene
		)
		
		this.effectComposer = postProcessing.effectComposer
		this.asciiEffect = postProcessing.asciiEffect
		this.effectsConfig = postProcessing.effectsConfig
		
		// Add ASCII effect to DOM (insert before canvas so it doesn't block events)
		if (this.asciiEffect && this.asciiEffect.domElement) {
			const canvas = this.webglRenderer.instance.domElement
			const container = canvas.parentElement
			if (container) {
				// Insert before the canvas to ensure it doesn't block mouse events
				container.insertBefore(this.asciiEffect.domElement, canvas)
			}
		}

		// 4. Add camera controls fourth (after scene lights and before terrain in setupVaporwaveScene)
		const cameraFolder = this.debug.addFolder("Camera")
		VaporwaveScene.addCameraDebugControls(
			cameraFolder,
			this.cameraController.camera
		)
		cameraFolder.close()
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
				// Notify AppState when GUI changes (for sync with remote)
				if (this.onTaillightsChange) {
					this.onTaillightsChange(value)
				}
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
		// Stop rendering if scene is not mounted
		if (!this.mounted) {
			return
		}

		this.debug.begin()

		const elapsedTime = this.clock.getElapsedTime()
		const deltaTime = this.clock.getDelta()

		// Update animated elements
		this.updateAnimations(elapsedTime)

		// Update camera from device data or orbit controls
		this.updateCamera(deltaTime)

		// Render
		if (this.effectsConfig && this.effectsConfig.useAscii && this.asciiEffect) {
			// Use ASCII effect renderer
			this.asciiEffect.render(this.scene, this.cameraController.camera)
		} else if (this.effectComposer) {
			// Use normal post-processing
			this.effectComposer.render()
		} else {
			// Fallback to basic rendering
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

		// Update light helpers via VehicleManager
		if (this.vehicleManager) {
			this.vehicleManager.updateHelpers()
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
	 * Reset camera to initial state (called on RTC disconnect)
	 */
	resetCamera() {
		// Clear device data so updateCamera switches to orbit controls
		this.data = {}
		
		// Reset camera to initial state
		if (this.cameraController) {
			this.cameraController.resetToInitial()
		}
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
		if (this.vehicleManager) {
			// Delegate to VehicleManager, passing GUI controllers if they exist
			this.vehicleManager.applyLightStates(
				headlightsOn, 
				taillightsOn,
				this.headlightToggleController,
				this.taillightToggleController
			)
		}
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
		
		if (this.asciiEffect) {
			this.asciiEffect.setSize(width, height)
		}
	}

	/**
	 * Clean up resources and stop animation
	 */
	dispose() {
		this.mounted = false
		window.removeEventListener("resize", this.resize)
		
		// Clean up ASCII effect DOM element
		if (this.asciiEffect && this.asciiEffect.domElement && this.asciiEffect.domElement.parentElement) {
			this.asciiEffect.domElement.parentElement.removeChild(this.asciiEffect.domElement)
		}
		
		this.webglRenderer.dispose()
		this.cameraController.dispose()
	}
}

export default SceneBase
