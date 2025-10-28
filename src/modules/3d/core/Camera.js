import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

/**
 * Camera controller that manages perspective camera and orbit controls
 */
export class CameraController {
	/**
	 * Create a new camera controller
	 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer instance
	 * @param {Object} options - Camera configuration options
	 * @param {number} [options.fov=110] - Field of view
	 * @param {number} [options.near=0.01] - Near clipping plane
	 * @param {number} [options.far=1000] - Far clipping plane
	 * @param {Object} [options.position] - Initial camera position
	 * @param {number} [options.position.x=0] - X position
	 * @param {number} [options.position.y=0.02] - Y position
	 * @param {number} [options.position.z=0.047] - Z position
	 */
	constructor(renderer, options = {}) {
		this.camera = new THREE.PerspectiveCamera(
			options.fov || 110,
			window.innerWidth / window.innerHeight,
			options.near || 0.01,
			options.far || 1000
		)

		this.camera.position.set(
			options.position?.x || 0,
			options.position?.y || 0.02,
			options.position?.z || 0.047
		)

		this.camera.lookAt(0, 10.1, 0)

		this.controls = new OrbitControls(this.camera, renderer.domElement)
		this.controls.enableDamping = true
		this.controls.autoRotate = true
		this.controls.autoRotateSpeed = 1.0 // Half of default (2.0)
		this.controls.update()
	}

	/**
	 * Update orbit controls (call each frame)
	 */
	update() {
		if (this.controls) {
			this.controls.update()
		}
	}

	/**
	 * Enable or disable auto-rotation
	 * @param {boolean} enabled - Whether auto-rotation should be enabled
	 */
	enableAutoRotate(enabled) {
		if (this.controls) {
			this.controls.autoRotate = enabled
		}
	}

	/**
	 * Handle window resize
	 * @param {number} width - New window width
	 * @param {number} height - New window height
	 */
	resize(width, height) {
		this.camera.aspect = width / height
		this.camera.updateProjectionMatrix()
	}

	/**
	 * Clean up resources
	 */
	dispose() {
		if (this.controls) {
			this.controls.dispose()
		}
	}
}

