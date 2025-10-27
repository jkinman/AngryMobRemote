import * as THREE from "three"
import * as CameraTools from "../DeviceCameraTools"
import theme from "../../style/_vars.scss"

import { WebGLRendererWrapper } from "./core/Renderer"
import { CameraController } from "./core/Camera"
import { DebugTools } from "./utils/DebugTools"
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
	 * @param {boolean} [props.showControls=false] - Whether to show debug controls
	 */
	constructor(props = {}) {
		this.mounted = false
		this.clock = new THREE.Clock()
		this.data = {}
		this.showControls = props.showControls || false
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
		textureCube.encoding = THREE.sRGBEncoding
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

		// Update animated elements
		this.updateAnimations(elapsedTime)

		// Update camera from device data or orbit controls
		this.updateCamera()

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
	}

	/**
	 * Update camera based on device orientation or orbit controls
	 * @private
	 */
	updateCamera() {
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
