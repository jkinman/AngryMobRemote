import * as THREE from "three"
import theme from "../../style/_vars.scss"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass"
// import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass"
// import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass"

export const makeVaporwaveScene = (gui) => {
	// Textures
	const textureLoader = new THREE.TextureLoader()
	const gridTexture = textureLoader.load("/grid-6.png")
	const heightTexture = textureLoader.load("/displacement-7.png")
	const metalnessTexture = textureLoader.load("/metalness-2.png")
	// const gridTextureSm = new THREE.TextureLoader().load(
	// 	"textures/ground-blue-tile.jpg"
	// )
	// gridTextureSm.wrapS = THREE.RepeatWrapping
	// gridTextureSm.wrapT = THREE.RepeatWrapping
	// gridTextureSm.repeat.set(100, 100)

	// Plane
	const parameters = {
		displacementScale: 0.55,
		metalness: 0.7,
		roughness: 0.5,
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

export const setUpVaporwavePost = (gui, renderer, camera, scene) => {
	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight,
	}
	// Post-processing
	const effectComposer = new EffectComposer(renderer)
	effectComposer.setSize(sizes.width, sizes.height)
	effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

	const renderPass = new RenderPass(scene, camera)
	effectComposer.addPass(renderPass)

	const folder = gui.addFolder("post")

	// const bokehPass = new BokehPass(scene, camera, {focus:0.02,aspect:camera.aspect, aperture : 0.025, maxblur : 1.0})
	// effectComposer.addPass(bokehPass)

	// const sSAOPass = new SSAOPass(scene, camera, sizes.width, sizes.height)
	// effectComposer.addPass(sSAOPass)

	const rgbShiftPass = new ShaderPass(RGBShiftShader)
	rgbShiftPass.uniforms["amount"].value = 0.001
	folder
		.add(rgbShiftPass.uniforms["amount"], "value")
		.min(0)
		.max(0.01)
		.step(0.00001)
		.name("RGBShift intensity")
	effectComposer.addPass(rgbShiftPass)
	const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
	effectComposer.addPass(gammaCorrectionPass)

	var bloomParams = {
		strength: 0.3,
	}

	const bloomPass = new UnrealBloomPass()
	bloomPass.strength = bloomParams.strength

	folder
		.add(bloomParams, "strength", 0.0, 3.0)
		.onChange((value) => {
			bloomPass.strength = Number(value)
		})
		.name("Bloom Strength")

	effectComposer.addPass(bloomPass)

	const filmPass = new FilmPass(
		0.25, // noise intensity
		0.34, // scanline intensity
		900, // scanline count
		false // grayscale
	)

	folder.add(filmPass.uniforms.grayscale, "value").name("grayscale")
	folder
		.add(filmPass.uniforms.nIntensity, "value", 0, 1)
		.name("noise intensity")
	folder
		.add(filmPass.uniforms.sIntensity, "value", 0, 1)
		.name("scanline intensity")
	folder
		.add(filmPass.uniforms.sCount, "value", 0, 1000)
		.name("scanline count")
	folder.close()

	effectComposer.addPass(filmPass)
	return effectComposer
}
export const addVaporwaveLights = (scene, gui) => {
	const ambientLight = new THREE.AmbientLight(theme.themeColour1, 10)
	scene.add(ambientLight)
	gui
		.add(ambientLight, "intensity")
		.min(0)
		.max(100)
		.step(0.001)
		.name("AmbientLight intensity")
	gui.addColor(ambientLight, "color").name("AmbientLight color")

	const spotlight = new THREE.SpotLight(theme.themeColour4, 20, 25, Math.PI * 0.1, 0.25)
	spotlight.position.set(0.5, 0.75, 2.1)
	spotlight.target.position.x = -0.25
	spotlight.target.position.y = 0.25
	spotlight.target.position.z = 0.25
	scene.add(spotlight)
	scene.add(spotlight.target)

	const spotlight2 = new THREE.SpotLight(theme.themeColour2, 20, 25, Math.PI * 0.1, 0.25)
	spotlight2.position.set(-0.5, 0.75, 2.1)
	spotlight2.target.position.x = 0.25
	spotlight2.target.position.y = 0.25
	spotlight2.target.position.z = 0.25
	scene.add(spotlight2)
	scene.add(spotlight2.target)

	gui
		.add(spotlight, "intensity")
		.min(0)
		.max(50)
		.step(0.001)
		.name("Spotlight 1 intensity")
	gui
		.add(spotlight2, "intensity")
		.min(0)
		.max(50)
		.step(0.001)
		.name("Spotlight 2 intensity")

	gui.addColor(spotlight, "color").name("Spotlight 1 color")
	gui.addColor(spotlight2, "color").name("Spotlight 2 color")

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

export const addCameraGui = (gui, camera) => {
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
export const makeSun = () => {
    const geometry = new THREE.SphereGeometry(250, 4, 4)
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(0, 0, -1000)
    return sphere
}

// old method
export const makeGround = () => {
	const texture = new THREE.TextureLoader().load(
		"textures/ground-blue-tile.jpg"
	)

	texture.wrapS = THREE.RepeatWrapping
	texture.wrapT = THREE.RepeatWrapping
	texture.repeat.set(100, 100)

	this.groundTexture = texture
	// immediately use the texture for material creation
	const material = new THREE.MeshBasicMaterial({ map: texture })
	let geometry = new THREE.PlaneGeometry(100, 100, 1, 1)
	let terrain = new THREE.Mesh(geometry, material)
	terrain.rotation.x = -Math.PI / 2
	return terrain

	// const geometry = new THREE.PlaneGeometry(250, 250, 100, 100)
	// const wireframe = new THREE.WireframeGeometry(geometry)
	// const terrain = new THREE.LineSegments(wireframe)
	// terrain.rotation.x = -Math.PI / 2
	// terrain.position.set(0, 0, 50)
	// terrain.material.depthTest = true
	// terrain.material.opacity = 1
	// terrain.material.transparent = false
	// terrain.material.color.setHex(0xffffff)

	// const geometry2 = new THREE.PlaneGeometry(250, 250, 100, 100)
	// const material = new THREE.MeshBasicMaterial({ color: 0x000000 })
	// const terrain2 = new THREE.Mesh(geometry2, material)
	// terrain2.rotation.x = -Math.PI / 2
	// terrain2.position.set(0, 0, 55)
	// terrain2.material.depthTest = true
	// terrain2.material.opacity = 1
	// terrain2.material.transparent = false

	// const group = new THREE.Object3D()
	// group.add(terrain2)
	// group.add(terrain)
	// return group
}
