import * as THREE from "three"

/**
 * TerrainFactory - Creates the vaporwave terrain with animated ground planes
 * Extracted from VaporwaveScene.js for better modularity
 */

/**
 * Create the vaporwave terrain with animated ground planes
 * @param {dat.GUI} gui - Debug GUI folder for terrain controls
 * @returns {THREE.Object3D} Group containing terrain meshes
 */
export const createTerrain = (gui) => {
	// Textures
	const textureLoader = new THREE.TextureLoader()
	const gridTexture = textureLoader.load("/grid-6.png")
	const heightTexture = textureLoader.load("/displacement-7.png")
	const metalnessTexture = textureLoader.load("/metalness-2.png")

	// Plane
	const parameters = {
		displacementScale: 0.55,
		metalness: 0.1641,
		roughness: 1,
	}

	const geometry = new THREE.PlaneGeometry(1, 2, 24, 24)
	const material = new THREE.MeshStandardMaterial({
		map: gridTexture,
		displacementMap: heightTexture,
		displacementScale: parameters.displacementScale,
		metalness: parameters.metalness,
		metalnessMap: metalnessTexture,
		roughness: parameters.roughness,
	})
	
	const plane = new THREE.Mesh(geometry, material)
	plane.name = "vaporWaveGround1"
	const plane2 = new THREE.Mesh(geometry, material)
	plane2.name = "vaporWaveGround2"

	plane.rotation.x = -Math.PI * 0.5
	plane2.rotation.x = -Math.PI * 0.5

	plane.position.y = -0.02
	plane.position.z = 0.15
	plane2.position.y = -0.02
	plane2.position.z = -1.85

	const group = new THREE.Object3D()
	group.name = "vaporWaveScene"
	group.add(plane)
	group.add(plane2)

	// Debug controls
	gui
		.add(material, "displacementScale")
		.min(0)
		.max(5)
		.step(0.001)
		.name("Terrain intensity")
	gui.add(material, "metalness", 0, 1, 0.0001).name("Material metalness")
	gui.add(material, "roughness", 0, 1, 0.0001).name("Material roughness")

	return group
}

export default createTerrain

