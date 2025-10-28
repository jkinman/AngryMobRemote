import * as THREE from "three"
import theme from "../../../style/_vars.scss"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js"

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

/**
 * Set up post-processing effects for vaporwave aesthetic
 * @param {dat.GUI} gui - Debug GUI for post-processing controls
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @param {THREE.Camera} camera - The scene camera
 * @param {THREE.Scene} scene - The scene to render
 * @returns {EffectComposer} Configured effect composer
 */
export const createPostProcessing = (gui, renderer, camera, scene) => {
	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight,
	}
	
	// Performance configuration
	const effectsConfig = {
		useRGBShift: true,
		useBloom: true,
		useFilm: false,  // Off by default
		pixelRatio: 2.0,  // Full quality on Retina displays
		bloomStrength: 0.3,
		scanlineCount: 300,  // Lower from 900 for better performance
		enableGlitch: true,  // Electromagnetic disturbance effect
		glitchMinInterval: 8,  // Minimum seconds between glitches
		glitchMaxInterval: 20,  // Maximum seconds between glitches
		baseRGBShift: 0,  // No RGB shift normally
		maxRGBShift: 0.1  // Maximum RGB shift during glitch
	}
	
	const effectComposer = new EffectComposer(renderer)
	effectComposer.setSize(sizes.width, sizes.height)
	effectComposer.setPixelRatio(effectsConfig.pixelRatio)

	// Base passes (always on)
	const renderPass = new RenderPass(scene, camera)
	effectComposer.addPass(renderPass)
	
	const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
	effectComposer.addPass(gammaCorrectionPass)

	// Optional RGB Shift
	const rgbShiftPass = new ShaderPass(RGBShiftShader)
	rgbShiftPass.uniforms["amount"].value = effectsConfig.baseRGBShift
	rgbShiftPass.enabled = true  // Explicitly enable
	effectComposer.addPass(rgbShiftPass)
	
	// Electromagnetic glitch effect system
	let glitchTimeout = null
	let isGlitching = false
	
	const triggerGlitch = () => {
		if (!effectsConfig.enableGlitch || !rgbShiftPass.enabled) {
			scheduleNextGlitch()
			return
		}
		
		isGlitching = true
		const startValue = rgbShiftPass.uniforms["amount"].value
		const targetValue = effectsConfig.maxRGBShift * (0.8 + Math.random() * 0.4) // 80-120% of max
		const glitchDuration = 200 + Math.random() * 300 // 200-500ms spike
		const startTime = Date.now()
		
		// Animate RGB shift spike
		const animateGlitch = () => {
			const elapsed = Date.now() - startTime
			const progress = Math.min(elapsed / glitchDuration, 1)
			
			if (progress < 0.3) {
				// Ramp up quickly (0-30% of duration)
				const rampProgress = progress / 0.3
				rgbShiftPass.uniforms["amount"].value = startValue + (targetValue - startValue) * rampProgress
				requestAnimationFrame(animateGlitch)
			} else if (progress < 0.5) {
				// Hold at peak (30-50% of duration)
				rgbShiftPass.uniforms["amount"].value = targetValue
				requestAnimationFrame(animateGlitch)
			} else if (progress < 1) {
				// Fade back down (50-100% of duration)
				const fadeProgress = (progress - 0.5) / 0.5
				rgbShiftPass.uniforms["amount"].value = targetValue - (targetValue - effectsConfig.baseRGBShift) * fadeProgress
				requestAnimationFrame(animateGlitch)
			} else {
				// Reset to base value
				rgbShiftPass.uniforms["amount"].value = effectsConfig.baseRGBShift
				isGlitching = false
				scheduleNextGlitch()
			}
		}
		
		animateGlitch()
	}
	
	const scheduleNextGlitch = () => {
		if (glitchTimeout) clearTimeout(glitchTimeout)
		
		// Random interval between min and max
		const interval = (effectsConfig.glitchMinInterval + 
			Math.random() * (effectsConfig.glitchMaxInterval - effectsConfig.glitchMinInterval)) * 1000
		
		glitchTimeout = setTimeout(triggerGlitch, interval)
	}
	
	// Start the glitch cycle
	if (effectsConfig.enableGlitch) {
		scheduleNextGlitch()
	}
	
	// Optional Bloom (most expensive)
	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(sizes.width, sizes.height),
		effectsConfig.bloomStrength,
		0.4,  // radius
		0.85  // threshold
	)
	bloomPass.enabled = true  // Explicitly enable
	effectComposer.addPass(bloomPass)

	// Optional Film (expensive - scanlines)
	const filmPass = new FilmPass(0.35, 0.34, effectsConfig.scanlineCount, false)
	filmPass.enabled = effectsConfig.useFilm  // Off by default
	effectComposer.addPass(filmPass)
	
	// Set initial renderToScreen on last enabled pass
	const initialPasses = [rgbShiftPass, bloomPass, filmPass]
	let lastEnabledPass = null
	initialPasses.forEach(pass => {
		if (pass.enabled) lastEnabledPass = pass
	})
	if (lastEnabledPass) lastEnabledPass.renderToScreen = true

	// Post-Processing GUI folder
	const perfFolder = gui.addFolder("Post-Processing")
	
	// Function to update which pass renders to screen (must be declared before use)
	const updateRenderToScreen = () => {
		// Find the last enabled pass and make it render to screen
		const passes = [rgbShiftPass, bloomPass, filmPass]
		let lastEnabledPass = null
		passes.forEach(pass => {
			pass.renderToScreen = false
			if (pass.enabled) lastEnabledPass = pass
		})
		if (lastEnabledPass) lastEnabledPass.renderToScreen = true
	}
	
	perfFolder.add(effectsConfig, 'pixelRatio', 0.5, 2, 0.1)
		.name("Pixel Ratio")
		.onChange((value) => {
			effectComposer.setPixelRatio(value)
		})
	
	perfFolder.add(effectsConfig, 'useRGBShift')
		.name("Enable RGB Shift")
		.onChange((value) => { 
			rgbShiftPass.enabled = value
			updateRenderToScreen()
		})
	
	perfFolder.add(effectsConfig, 'useBloom')
		.name("Enable Bloom")
		.onChange((value) => { 
			bloomPass.enabled = value
			updateRenderToScreen()
		})
	
	perfFolder.add(effectsConfig, 'bloomStrength', 0.0, 3.0, 0.1)
		.name("Bloom Intensity")
		.onChange((value) => { bloomPass.strength = value })
	
	perfFolder.add(effectsConfig, 'useFilm')
		.name("Enable Film Grain")
		.onChange((value) => { 
			filmPass.enabled = value
			updateRenderToScreen()
		})
	
	perfFolder.add(effectsConfig, 'scanlineCount', 100, 1000, 100)
		.name("Scanline Count")
		.onChange((value) => {
			filmPass.uniforms.sCount.value = value
		})
	
	perfFolder.open()  // Keep open for easy testing

	// Advanced controls in separate folder
	const folder = gui.addFolder("Advanced")
	folder.add(effectsConfig, 'enableGlitch')
		.name("EM Disturbance Effect")
		.onChange((value) => {
			if (value) scheduleNextGlitch()
			else if (glitchTimeout) clearTimeout(glitchTimeout)
		})
	folder.add(effectsConfig, 'glitchMinInterval', 3, 30, 1)
		.name("Min Interval (sec)")
	folder.add(effectsConfig, 'glitchMaxInterval', 10, 60, 1)
		.name("Max Interval (sec)")
	folder.add(effectsConfig, 'baseRGBShift', 0, 0.01, 0.0001)
		.name("Base RGB Shift")
		.onChange((value) => {
			if (!isGlitching) rgbShiftPass.uniforms["amount"].value = value
		})
	folder.add(effectsConfig, 'maxRGBShift', 0.001, 0.02, 0.001)
		.name("Max Glitch Intensity")
	folder.close()

	return effectComposer
}

/**
 * Set up vaporwave lighting (ambient + spotlights)
 * @param {THREE.Scene} scene - The scene to add lights to
 * @param {dat.GUI} gui - Debug GUI folder for light controls
 */
export const setupLights = (scene, gui) => {
	const ambientLight = new THREE.AmbientLight(theme.themeColour1, 16)
	scene.add(ambientLight)
	gui
		.add(ambientLight, "intensity")
		.min(0)
		.max(100)
		.step(0.001)
		.name("AmbientLight intensity")
	gui.addColor(ambientLight, "color").name("AmbientLight color")

	// Spotlight 1
	const spotlight = new THREE.SpotLight(theme.themeColour4, 6, 25, Math.PI * 0.1, 0.25)
	spotlight.position.set(0.5, 0.75, 2.1)
	spotlight.target.position.x = -0.25
	spotlight.target.position.y = 0.25
	spotlight.target.position.z = 0.25
	scene.add(spotlight)
	scene.add(spotlight.target)

	// Spotlight 2
	const spotlight2 = new THREE.SpotLight(theme.themeColour2, 6, 25, Math.PI * 0.1, 0.25)
	spotlight2.position.set(-0.5, 0.75, 2.1)
	spotlight2.target.position.x = 0.25
	spotlight2.target.position.y = 0.25
	spotlight2.target.position.z = 0.25
	scene.add(spotlight2)
	scene.add(spotlight2.target)

	// Debug controls for spotlight 1
	gui
		.add(spotlight, "intensity")
		.min(0)
		.max(50)
		.step(0.001)
		.name("Spotlight 1 intensity")
	gui.addColor(spotlight, "color").name("Spotlight 1 color")
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

	// Debug controls for spotlight 2
	gui
		.add(spotlight2, "intensity")
		.min(0)
		.max(50)
		.step(0.001)
		.name("Spotlight 2 intensity")
	gui.addColor(spotlight2, "color").name("Spotlight 2 color")
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

/**
 * Add camera debug controls to GUI
 * @param {dat.GUI} gui - Debug GUI
 * @param {THREE.Camera} camera - Camera to control
 */
export const addCameraDebugControls = (gui, camera) => {
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

/**
 * Create a sun sphere (legacy - kept for future use)
 * @returns {THREE.Mesh} Sun sphere mesh
 */
export const createSun = () => {
	const geometry = new THREE.SphereGeometry(250, 4, 4)
	const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
	const sphere = new THREE.Mesh(geometry, material)
	sphere.position.set(0, 0, -1000)
	return sphere
}
