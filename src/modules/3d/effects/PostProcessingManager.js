import * as THREE from "three"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js"
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js"

// Custom Grayscale Shader
const GrayscaleShader = {
	uniforms: {
		'tDiffuse': { value: null },
		'amount': { value: 1.0 }
	},
	vertexShader: `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
	fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform float amount;
		varying vec2 vUv;
		void main() {
			vec4 color = texture2D(tDiffuse, vUv);
			float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
			gl_FragColor = vec4(mix(color.rgb, vec3(gray), amount), color.a);
		}
	`
}

/**
 * PostProcessingManager - Manages post-processing effects and glitch system
 * Extracted from VaporwaveScene.js for better modularity
 */
export class PostProcessingManager {
	constructor(gui, renderer, camera, scene) {
		this.gui = gui
		this.renderer = renderer
		this.camera = camera
		this.scene = scene
		
		this.effectComposer = null
		this.asciiEffect = null
		this.effectsConfig = null
		
		// References to individual passes
		this.rgbShiftPass = null
		this.bloomPass = null
		this.filmPass = null
		this.grayscalePass = null
		
		// Glitch system state
		this.glitchTimeout = null
		this.isGlitching = false
		this.activeAnimationFrames = []
		this.activeSpikeTimeouts = []
	}

	/**
	 * Initialize post-processing effects
	 * @returns {Object} { effectComposer, asciiEffect, effectsConfig }
	 */
	initialize() {
		const sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		}
		
		// Performance configuration
		this.effectsConfig = {
			useRGBShift: true,
			useBloom: true,
			useFilm: false,  // Off by default
			useGrayscale: false,  // Black & white effect
			grayscaleAmount: 1.0,  // 0 = color, 1 = full grayscale
			useAscii: false,  // ASCII rendering mode
			pixelRatio: 2.0,  // Full quality on Retina displays
			bloomStrength: 0.3,
			scanlineCount: 300,  // Lower from 900 for better performance
			enableGlitch: true,  // Electromagnetic disturbance effect
			glitchMinInterval: 8,  // Minimum seconds between glitches
			glitchMaxInterval: 20,  // Maximum seconds between glitches
			baseRGBShift: 0,  // No RGB shift normally
			maxRGBShift: 0.1,  // Maximum RGB shift during glitch
			// Multi-spike glitch parameters
			minSpikes: 2,  // Minimum number of spikes per glitch
			maxSpikes: 5,  // Maximum number of spikes per glitch
			spikeDurationMin: 30,  // Minimum spike duration (ms)
			spikeDurationMax: 80,  // Maximum spike duration (ms)
			interSpikeDelayMin: 20,  // Minimum delay between spikes (ms)
			interSpikeDelayMax: 150  // Maximum delay between spikes (ms)
		}
		
		this.effectComposer = new EffectComposer(this.renderer)
		this.effectComposer.setSize(sizes.width, sizes.height)
		this.effectComposer.setPixelRatio(this.effectsConfig.pixelRatio)

		// Base passes (always on)
		const renderPass = new RenderPass(this.scene, this.camera)
		this.effectComposer.addPass(renderPass)
		
		const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
		this.effectComposer.addPass(gammaCorrectionPass)

		// Optional RGB Shift
		this.rgbShiftPass = new ShaderPass(RGBShiftShader)
		this.rgbShiftPass.uniforms["amount"].value = this.effectsConfig.baseRGBShift
		this.rgbShiftPass.enabled = true  // Explicitly enable
		this.effectComposer.addPass(this.rgbShiftPass)
		
		// Optional Bloom (most expensive)
		this.bloomPass = new UnrealBloomPass(
			new THREE.Vector2(sizes.width, sizes.height),
			this.effectsConfig.bloomStrength,
			0.4,  // radius
			0.85  // threshold
		)
		this.bloomPass.enabled = true  // Explicitly enable
		this.effectComposer.addPass(this.bloomPass)

		// Optional Film (expensive - scanlines)
		this.filmPass = new FilmPass(0.35, 0.34, this.effectsConfig.scanlineCount, false)
		this.filmPass.enabled = this.effectsConfig.useFilm  // Off by default
		this.effectComposer.addPass(this.filmPass)
		
		// Optional Grayscale (black & white)
		this.grayscalePass = new ShaderPass(GrayscaleShader)
		this.grayscalePass.uniforms["amount"].value = this.effectsConfig.grayscaleAmount
		this.grayscalePass.enabled = this.effectsConfig.useGrayscale
		this.effectComposer.addPass(this.grayscalePass)
		
		// ASCII Effect (alternative renderer)
		this.asciiEffect = new AsciiEffect(this.renderer, ' .:-+*=%@#', { invert: true })
		this.asciiEffect.setSize(sizes.width, sizes.height)
		this.asciiEffect.domElement.style.position = 'absolute'
		this.asciiEffect.domElement.style.top = '0'
		this.asciiEffect.domElement.style.left = '0'
		this.asciiEffect.domElement.style.width = '100%'
		this.asciiEffect.domElement.style.height = '100%'
		this.asciiEffect.domElement.style.zIndex = '1'  // Lower than dat.GUI (which is typically 1000+)
		this.asciiEffect.domElement.style.pointerEvents = 'none'  // Critical: don't block mouse events
		this.asciiEffect.domElement.style.color = '#00ff00'
		this.asciiEffect.domElement.style.backgroundColor = 'transparent'  // Transparent background!
		this.asciiEffect.domElement.style.mixBlendMode = 'screen'  // Blend mode for better visibility
		this.asciiEffect.domElement.style.display = this.effectsConfig.useAscii ? 'block' : 'none'
		this.asciiEffect.domElement.style.visibility = this.effectsConfig.useAscii ? 'visible' : 'hidden'
		this.asciiEffect.domElement.style.userSelect = 'none'  // Prevent text selection
		this.asciiEffect.domElement.style.webkitUserSelect = 'none'
		this.asciiEffect.domElement.setAttribute('data-ascii-effect', 'true')  // For debugging
		
		// Set initial renderToScreen on last enabled pass
		const initialPasses = [this.rgbShiftPass, this.bloomPass, this.filmPass, this.grayscalePass]
		let lastEnabledPass = null
		initialPasses.forEach(pass => {
			if (pass.enabled) lastEnabledPass = pass
		})
		if (lastEnabledPass) lastEnabledPass.renderToScreen = true

		// Setup GUI controls
		this.setupGUIControls()
		
		// Start the glitch cycle
		if (this.effectsConfig.enableGlitch) {
			this.scheduleNextGlitch()
		}

		return {
			effectComposer: this.effectComposer,
			asciiEffect: this.asciiEffect,
			effectsConfig: this.effectsConfig
		}
	}

	/**
	 * Setup GUI controls for post-processing
	 * @private
	 */
	setupGUIControls() {
		const perfFolder = this.gui.addFolder("Post-Processing")
		
		perfFolder.add(this.effectsConfig, 'pixelRatio', 0.5, 2, 0.1)
			.name("Pixel Ratio")
			.onChange((value) => {
				this.effectComposer.setPixelRatio(value)
			})
		
		perfFolder.add(this.effectsConfig, 'useRGBShift')
			.name("Enable RGB Shift")
			.onChange((value) => { 
				this.rgbShiftPass.enabled = value
				this.updateRenderToScreen()
			})
		
		perfFolder.add(this.effectsConfig, 'useBloom')
			.name("Enable Bloom")
			.onChange((value) => { 
				this.bloomPass.enabled = value
				this.updateRenderToScreen()
			})
		
		perfFolder.add(this.effectsConfig, 'bloomStrength', 0.0, 3.0, 0.1)
			.name("Bloom Intensity")
			.onChange((value) => { this.bloomPass.strength = value })
		
		perfFolder.add(this.effectsConfig, 'useFilm')
			.name("Enable Film Grain")
			.onChange((value) => { 
				this.filmPass.enabled = value
				this.updateRenderToScreen()
			})
		
		perfFolder.add(this.effectsConfig, 'scanlineCount', 100, 1000, 100)
			.name("Scanline Count")
			.onChange((value) => {
				this.filmPass.uniforms.sCount.value = value
			})
		
		perfFolder.add(this.effectsConfig, 'useGrayscale')
			.name("Enable Grayscale/B&W")
			.onChange((value) => { 
				this.grayscalePass.enabled = value
				this.updateRenderToScreen()
			})
		
		perfFolder.add(this.effectsConfig, 'grayscaleAmount', 0.0, 1.0, 0.01)
			.name("Grayscale Amount")
			.onChange((value) => {
				this.grayscalePass.uniforms["amount"].value = value
			})
		
		perfFolder.add(this.effectsConfig, 'useAscii')
			.name("Enable ASCII Effect")
			.onChange((value) => {
				this.effectsConfig.useAscii = value
				if (value) {
					this.asciiEffect.domElement.style.display = 'block'
					this.asciiEffect.domElement.style.visibility = 'visible'
				} else {
					this.asciiEffect.domElement.style.display = 'none'
					this.asciiEffect.domElement.style.visibility = 'hidden'
				}
			})
		
		perfFolder.close()  // Closed by default for accordion behavior

		// Advanced controls in separate folder
		const folder = this.gui.addFolder("Advanced")
		folder.add(this.effectsConfig, 'enableGlitch')
			.name("EM Disturbance Effect")
			.onChange((value) => {
				if (value) {
					this.scheduleNextGlitch()
				} else {
					this.stopGlitchSystem()
				}
			})
		folder.add(this.effectsConfig, 'glitchMinInterval', 3, 30, 1)
			.name("Min Interval (sec)")
		folder.add(this.effectsConfig, 'glitchMaxInterval', 10, 60, 1)
			.name("Max Interval (sec)")
		folder.add(this.effectsConfig, 'baseRGBShift', 0, 0.01, 0.0001)
			.name("Base RGB Shift")
			.onChange((value) => {
				if (!this.isGlitching) this.rgbShiftPass.uniforms["amount"].value = value
			})
		folder.add(this.effectsConfig, 'maxRGBShift', 0.001, 0.02, 0.001)
			.name("Max Glitch Intensity")
		folder.add(this.effectsConfig, 'minSpikes', 1, 8, 1)
			.name("Min Spikes")
		folder.add(this.effectsConfig, 'maxSpikes', 2, 10, 1)
			.name("Max Spikes")
		folder.add(this.effectsConfig, 'spikeDurationMin', 20, 100, 5)
			.name("Min Spike Duration (ms)")
		folder.add(this.effectsConfig, 'spikeDurationMax', 50, 200, 5)
			.name("Max Spike Duration (ms)")
		folder.add(this.effectsConfig, 'interSpikeDelayMin', 10, 100, 5)
			.name("Min Inter-Spike Delay (ms)")
		folder.add(this.effectsConfig, 'interSpikeDelayMax', 100, 300, 10)
			.name("Max Inter-Spike Delay (ms)")
		folder.close()
	}

	/**
	 * Update which pass renders to screen
	 * @private
	 */
	updateRenderToScreen() {
		// Find the last enabled pass and make it render to screen
		const passes = [this.rgbShiftPass, this.bloomPass, this.filmPass, this.grayscalePass]
		let lastEnabledPass = null
		passes.forEach(pass => {
			pass.renderToScreen = false
			if (pass.enabled) lastEnabledPass = pass
		})
		if (lastEnabledPass) lastEnabledPass.renderToScreen = true
	}

	/**
	 * Cleanup function to cancel all pending animations
	 * @private
	 */
	cleanupGlitchAnimations() {
		// Cancel all pending animation frames
		this.activeAnimationFrames.forEach(id => cancelAnimationFrame(id))
		this.activeAnimationFrames = []
		
		// Cancel all pending spike timeouts
		this.activeSpikeTimeouts.forEach(id => clearTimeout(id))
		this.activeSpikeTimeouts = []
	}

	/**
	 * Trigger a glitch effect
	 * @private
	 */
	triggerGlitch() {
		if (!this.effectsConfig.enableGlitch) {
			this.scheduleNextGlitch()
			return
		}
		
		// Clean up any previous glitch animations before starting new ones
		this.cleanupGlitchAnimations()
		
		this.isGlitching = true
		
		// Randomly select glitch effect type: 0 = RGB shift, 1 = ASCII, 2 = Both
		const glitchType = Math.floor(Math.random() * 3)
		
		// Store original states to restore after glitch
		const originalRGBShift = this.rgbShiftPass.uniforms["amount"].value
		const originalAsciiEnabled = this.effectsConfig.useAscii
		
		// Generate multiple spikes with randomized parameters
		const numSpikes = Math.floor(this.effectsConfig.minSpikes + Math.random() * (this.effectsConfig.maxSpikes - this.effectsConfig.minSpikes + 1))
		const spikes = []
		
		for (let i = 0; i < numSpikes; i++) {
			spikes.push({
				intensity: 0.5 + Math.random() * 0.7, // 50-120% intensity
				duration: this.effectsConfig.spikeDurationMin + Math.random() * (this.effectsConfig.spikeDurationMax - this.effectsConfig.spikeDurationMin),
				delay: this.effectsConfig.interSpikeDelayMin + Math.random() * (this.effectsConfig.interSpikeDelayMax - this.effectsConfig.interSpikeDelayMin)
			})
		}
		
		let currentSpikeIndex = 0
		
		// Animate a single spike
		const animateSingleSpike = (spike) => {
			const startTime = Date.now()
			let startValue, targetValue
			
			// Set up values based on glitch type
			switch(glitchType) {
				case 0: // RGB Shift only
					startValue = this.rgbShiftPass.uniforms["amount"].value
					targetValue = this.effectsConfig.maxRGBShift * spike.intensity
					break
				case 1: // ASCII only
					if (!originalAsciiEnabled) {
						this.effectsConfig.useAscii = true
						this.asciiEffect.domElement.style.display = 'block'
						this.asciiEffect.domElement.style.visibility = 'visible'
					}
					// ASCII is binary (on/off), no gradual animation needed
					break
				case 2: // Both RGB Shift + ASCII
				default: // Default to case 2 behavior
					startValue = this.rgbShiftPass.uniforms["amount"].value
					targetValue = this.effectsConfig.maxRGBShift * spike.intensity
					if (!originalAsciiEnabled) {
						this.effectsConfig.useAscii = true
						this.asciiEffect.domElement.style.display = 'block'
						this.asciiEffect.domElement.style.visibility = 'visible'
					}
					break
			}
			
			const animate = () => {
				const elapsed = Date.now() - startTime
				const progress = Math.min(elapsed / spike.duration, 1)
				
				if (glitchType === 1) {
					// ASCII only: just hold for duration then turn off
					if (progress < 1) {
						const frameId = requestAnimationFrame(animate)
						this.activeAnimationFrames.push(frameId)
					} else {
						// Spike complete
						if (!originalAsciiEnabled) {
							this.effectsConfig.useAscii = false
							this.asciiEffect.domElement.style.display = 'none'
							this.asciiEffect.domElement.style.visibility = 'hidden'
						}
						currentSpikeIndex++
						
						if (currentSpikeIndex < spikes.length) {
							const timeoutId = setTimeout(() => {
								animateSingleSpike(spikes[currentSpikeIndex])
							}, spikes[currentSpikeIndex].delay)
							this.activeSpikeTimeouts.push(timeoutId)
						} else {
							this.cleanupGlitchAnimations()
							this.isGlitching = false
							this.scheduleNextGlitch()
						}
					}
				} else if (glitchType === 0) {
					// RGB Shift only: animate smoothly
					if (progress < 0.4) {
						// Ramp up quickly (0-40% of duration)
						const rampProgress = progress / 0.4
						this.rgbShiftPass.uniforms["amount"].value = startValue + (targetValue - startValue) * rampProgress
						
						const frameId = requestAnimationFrame(animate)
						this.activeAnimationFrames.push(frameId)
					} else if (progress < 0.6) {
						// Hold at peak (40-60% of duration)
						this.rgbShiftPass.uniforms["amount"].value = targetValue
						
						const frameId = requestAnimationFrame(animate)
						this.activeAnimationFrames.push(frameId)
					} else if (progress < 1) {
						// Fade back down (60-100% of duration)
						const fadeProgress = (progress - 0.6) / 0.4
						this.rgbShiftPass.uniforms["amount"].value = targetValue - (targetValue - this.effectsConfig.baseRGBShift) * fadeProgress
						
						const frameId = requestAnimationFrame(animate)
						this.activeAnimationFrames.push(frameId)
					} else {
						// Spike complete - reset to original values
						this.rgbShiftPass.uniforms["amount"].value = originalRGBShift
						
						currentSpikeIndex++
						
						if (currentSpikeIndex < spikes.length) {
							// Schedule next spike after delay
							const timeoutId = setTimeout(() => {
								animateSingleSpike(spikes[currentSpikeIndex])
							}, spikes[currentSpikeIndex].delay)
							this.activeSpikeTimeouts.push(timeoutId)
						} else {
							// All spikes complete
							this.cleanupGlitchAnimations()
							this.isGlitching = false
							this.scheduleNextGlitch()
						}
					}
				} else {
					// Both RGB + ASCII: animate RGB while ASCII stays on
					if (progress < 0.4) {
						// Ramp up quickly (0-40% of duration)
						const rampProgress = progress / 0.4
						this.rgbShiftPass.uniforms["amount"].value = startValue + (targetValue - startValue) * rampProgress
						
						const frameId = requestAnimationFrame(animate)
						this.activeAnimationFrames.push(frameId)
					} else if (progress < 0.6) {
						// Hold at peak (40-60% of duration)
						this.rgbShiftPass.uniforms["amount"].value = targetValue
						
						const frameId = requestAnimationFrame(animate)
						this.activeAnimationFrames.push(frameId)
					} else if (progress < 1) {
						// Fade back down (60-100% of duration)
						const fadeProgress = (progress - 0.6) / 0.4
						this.rgbShiftPass.uniforms["amount"].value = targetValue - (targetValue - this.effectsConfig.baseRGBShift) * fadeProgress
						
						const frameId = requestAnimationFrame(animate)
						this.activeAnimationFrames.push(frameId)
					} else {
						// Spike complete - reset both effects
						this.rgbShiftPass.uniforms["amount"].value = originalRGBShift
						
						if (!originalAsciiEnabled) {
							this.effectsConfig.useAscii = false
							this.asciiEffect.domElement.style.display = 'none'
							this.asciiEffect.domElement.style.visibility = 'hidden'
						}
						
						currentSpikeIndex++
						
						if (currentSpikeIndex < spikes.length) {
							// Schedule next spike after delay
							const timeoutId = setTimeout(() => {
								animateSingleSpike(spikes[currentSpikeIndex])
							}, spikes[currentSpikeIndex].delay)
							this.activeSpikeTimeouts.push(timeoutId)
						} else {
							// All spikes complete
							this.cleanupGlitchAnimations()
							this.isGlitching = false
							this.scheduleNextGlitch()
						}
					}
				}
			}
			
			animate()
		}
		
		// Start the first spike
		animateSingleSpike(spikes[0])
	}

	/**
	 * Schedule the next glitch
	 * @private
	 */
	scheduleNextGlitch() {
		if (this.glitchTimeout) clearTimeout(this.glitchTimeout)
		
		// Random interval between min and max
		const interval = (this.effectsConfig.glitchMinInterval + 
			Math.random() * (this.effectsConfig.glitchMaxInterval - this.effectsConfig.glitchMinInterval)) * 1000
		
		this.glitchTimeout = setTimeout(() => this.triggerGlitch(), interval)
	}

	/**
	 * Stop the glitch system and reset effects
	 */
	stopGlitchSystem() {
		// Clean up all glitch-related timers and animations
		if (this.glitchTimeout) clearTimeout(this.glitchTimeout)
		this.cleanupGlitchAnimations()
		this.isGlitching = false
		
		// Reset all glitch effects to their base/original state
		this.rgbShiftPass.uniforms["amount"].value = this.effectsConfig.baseRGBShift
		
		// Only hide ASCII if it wasn't manually enabled
		if (!this.effectsConfig.useAscii) {
			this.asciiEffect.domElement.style.display = 'none'
			this.asciiEffect.domElement.style.visibility = 'hidden'
		}
	}

	/**
	 * Resize the post-processing system
	 * @param {number} width - New width
	 * @param {number} height - New height
	 */
	resize(width, height) {
		if (this.effectComposer) {
			this.effectComposer.setSize(width, height)
			this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		}
		
		if (this.asciiEffect) {
			this.asciiEffect.setSize(width, height)
		}
	}

	/**
	 * Cleanup and dispose of resources
	 */
	dispose() {
		this.stopGlitchSystem()
		
		// Clean up ASCII effect DOM element
		if (this.asciiEffect && this.asciiEffect.domElement && this.asciiEffect.domElement.parentElement) {
			this.asciiEffect.domElement.parentElement.removeChild(this.asciiEffect.domElement)
		}
	}
}

export default PostProcessingManager

