import * as THREE from "three"

/**
 * WebGL renderer wrapper class
 */
export class WebGLRendererWrapper {
	/**
	 * Create a new WebGL renderer
	 * @param {Object} options - Renderer configuration options
	 * @param {string} [options.powerPreference='high-performance'] - Power preference
	 * @param {boolean} [options.antialias=false] - Enable antialiasing
	 * @param {boolean} [options.stencil=false] - Enable stencil buffer
	 * @param {boolean} [options.depth=false] - Enable depth buffer
	 */
	constructor(options = {}) {
		this.renderer = new THREE.WebGLRenderer({
			powerPreference: options.powerPreference || "high-performance",
			antialias: options.antialias || false,
			stencil: options.stencil || false,
			depth: options.depth || false,
		})

		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}

	/**
	 * Render the scene
	 * @param {THREE.Scene} scene - The scene to render
	 * @param {THREE.Camera} camera - The camera to use
	 */
	render(scene, camera) {
		this.renderer.render(scene, camera)
	}

	/**
	 * Handle window resize
	 * @param {number} width - New window width
	 * @param {number} height - New window height
	 */
	resize(width, height) {
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(width, height)
	}

	/**
	 * Clean up resources
	 */
	dispose() {
		this.renderer.dispose()
	}

	/**
	 * Get the canvas DOM element
	 * @returns {HTMLCanvasElement} The renderer's canvas element
	 */
	get domElement() {
		return this.renderer.domElement
	}

	/**
	 * Get the underlying Three.js renderer instance
	 * @returns {THREE.WebGLRenderer} The Three.js renderer
	 */
	get instance() {
		return this.renderer
	}
}

