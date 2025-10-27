import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

/**
 * Shared GLTF loader instance
 */
const loader = new GLTFLoader()

/**
 * Base GLTF loader function
 * @param {string} path - Path to the GLTF file
 * @returns {Promise<Object>} Promise that resolves with the loaded GLTF object
 */
export const loadGltf = (path) => {
	return new Promise((resolve, reject) => {
		loader.load(
			path,
			(gltf) => resolve(gltf),
			undefined, // onProgress - not needed
			(error) => reject(error)
		)
	})
}

/**
 * Load sci-fi vehicle model
 * @returns {Promise<THREE.Object3D>} Promise that resolves with the configured vehicle object
 */
export const loadScifiVehicle = () => {
	return loadGltf("mesh/sci-fi_vehicle_007_-_public_fomain/scene.gltf")
		.then((gltf) => {
			return gltf.scene
		})
		.catch((error) => {
			console.error("Failed to load sci-fi vehicle:", error)
			throw error
		})
}

/**
 * Load D20 dice model
 * @returns {Promise<THREE.Object3D>} Promise that resolves with the configured D20 object
 */
export const loadD20 = () => {
	return loadGltf("mesh/d20/scene.gltf")
		.then((gltf) => {
			const obj = gltf.scene
			obj.scale.set(0.3, 0.3, 0.3)
			obj.position.set(0, -30, -25)
			return obj
		})
		.catch((error) => {
			console.error("Failed to load D20:", error)
			throw error
		})
}

/**
 * Load mobile phone model
 * @returns {Promise<THREE.Object3D>} Promise that resolves with the configured mobile object
 */
export const loadMobile = () => {
	return loadGltf("mesh/low_poly_mobile_phone/scene.gltf")
		.then((gltf) => {
			const obj = gltf.scene
			obj.scale.set(30, 30, 30)
			return obj
		})
		.catch((error) => {
			console.error("Failed to load mobile:", error)
			throw error
		})
}

/**
 * Load camera model
 * @returns {Promise<THREE.Object3D>} Promise that resolves with the configured camera object
 */
export const loadCamera = () => {
	return loadGltf("1930s_movie_camera/scene.gltf")
		.then((gltf) => {
			const obj = gltf.scene
			obj.scale.set(0.1, 0.1, 0.1)
			obj.position.set(-20, 5, 10)
			return obj
		})
		.catch((error) => {
			console.error("Failed to load camera:", error)
			throw error
		})
}

/**
 * Load mystical forest scene
 * @returns {Promise<THREE.Object3D>} Promise that resolves with the configured forest object
 */
export const loadMysticalForestCartoon = () => {
	return loadGltf("mesh/mystical_forest_cartoon/scene.gltf")
		.then((gltf) => {
			const obj = gltf.scene
			obj.scale.set(0.1, 0.1, 0.1)
			obj.position.set(0, -10, 0)
			return obj
		})
		.catch((error) => {
			console.error("Failed to load mystical forest:", error)
			throw error
		})
}

/**
 * Load warehouse model
 * @returns {Promise<THREE.Object3D>} Promise that resolves with the configured warehouse object
 */
export const loadWarehouse = () => {
	return loadGltf("mesh/abandoned_warehouse_-_interior_scene/scene.gltf")
		.then((gltf) => {
			const obj = gltf.scene
			obj.scale.set(3, 3, 3)
			obj.position.set(0, 0, 10)
			return obj
		})
		.catch((error) => {
			console.error("Failed to load warehouse:", error)
			throw error
		})
}

/**
 * Load room model
 * @returns {Promise<THREE.Object3D>} Promise that resolves with the configured room object
 */
export const loadRoom = () => {
	return loadGltf("mesh/the_room/scene.gltf")
		.then((gltf) => {
			return gltf.scene
		})
		.catch((error) => {
			console.error("Failed to load room:", error)
			throw error
		})
}

/**
 * Load sci-fi corridor model
 * @returns {Promise<THREE.Object3D>} Promise that resolves with the configured corridor object
 */
export const loadScifiRoom = () => {
	return loadGltf("mesh/sci-fi_corridor/scene.gltf")
		.then((gltf) => {
			return gltf.scene
		})
		.catch((error) => {
			console.error("Failed to load sci-fi room:", error)
			throw error
		})
}

/**
 * Load sofa model
 * @returns {Promise<THREE.Object3D>} Promise that resolves with the configured sofa object
 */
export const loadSofa = () => {
	return loadGltf("mesh/leather_buttoned_sofa_low_v2/scene.gltf")
		.then((gltf) => {
			const obj = gltf.scene
			obj.scale.set(0.2, 0.2, 0.2)
			return obj
		})
		.catch((error) => {
			console.error("Failed to load sofa:", error)
			throw error
		})
}

/**
 * Load globe model
 * @returns {Promise<THREE.Object3D>} Promise that resolves with the configured globe object
 */
export const loadGlobe = () => {
	return loadGltf("props_-_scifi_globe/scene.gltf")
		.then((gltf) => {
			const obj = gltf.scene
			obj.scale.set(1, 1, 1)
			obj.position.set(0, -2, 40)
			return obj
		})
		.catch((error) => {
			console.error("Failed to load globe:", error)
			throw error
		})
}

export default loadGltf
