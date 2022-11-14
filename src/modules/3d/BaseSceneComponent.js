"use strict"

import React from "react"
import * as THREE from "three"
import Stats from "../../externals/three.js/examples/js/libs/stats.min.js"

let TWEEN = require("tween.js")

require("imports-loader?THREE=three!../../externals/three.js/examples/js/loaders/MTLLoader.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/loaders/OBJLoader.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/postprocessing/EffectComposer.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/postprocessing/RenderPass.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/postprocessing/ShaderPass.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/postprocessing/MaskPass.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/postprocessing/SSAOPass.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/postprocessing/GlitchPass.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/postprocessing/BloomPass.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/postprocessing/FilmPass.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/postprocessing/BokehPass.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/postprocessing/DotScreenPass.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/shaders/ConvolutionShader.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/shaders/DotScreenShader.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/shaders/CopyShader.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/shaders/RGBShiftShader.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/shaders/SSAOShader.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/shaders/FilmShader.js")
require("imports-loader?THREE=three!../../externals/three.js/examples/js/shaders/BokehShader.js")

require("imports-loader?THREE=three!../../externals/three.js/examples/js/controls/OrbitControls.js")

THREE.ImageUtils.crossOrigin = true

const CAMERA_ANIMATION_DELAY = 3000
const CAMERA_ROTATE_TIME = 3000
const TEXTURE_SIZE = 1024
const TEXTURE_HEIGHT = TEXTURE_SIZE
const TEXTURE_WIDTH = TEXTURE_SIZE
const PRIMARY = 0x53bdfd
const GREEN = 0x1ec503
const BACKGROUND_MESH = false

let testScene = new THREE.Scene()
let textureCamera
let shaderScene
let renderer, scene, camera
let depthMaterial
let effectComposer
let depthRenderTarget
let group
let depthScale = 1.0
let controls

class BaseSceneComponent extends React.Component {
	constructor(props, context, settings) {
		super(props, context)
		this.postprocessing = false
		this.baseClock = new THREE.Clock()
		// this.settings = settings ? this.settings = settings :
		this.settings = {
			showStats: false,
			datgui: false,
			controls: "orbit",
			elementId: "3cscene",
			...settings,
		}
		// this.datgui = props.datgui.addFolder( 'base scene' );
	}

	// 'delegate' functions
	showGlobalEvent(event) {}
	addBeacon(position, flagpolePosition, event) {}
	startAmbientAnimation() {}
	moveToBottom(cb) {}
	moveToMiddle(cb, paramPos) {}
	setVisionProperties(obj) {}

	startAmbientAnimation() {
		this.ambientAnimationOn = true
		requestAnimationFrame(this.doAmbientAnim.bind(this))
	}

	doAmbientAnim() {
		// camera.rotation.x += 0.0009;
		camera.rotation.y += 0.001
		if (this.ambientAnimationOn) {
			requestAnimationFrame(this.doAmbientAnim.bind(this))
		}
	}

	componentDidMount(preMadeCamera = false) {
		// setup rederer and add to DOM
		this.mounted = true
		const SCREEN_WIDTH = window.innerWidth
		const SCREEN_HEIGHT = window.innerHeight

		// setup off screen graphics buffer
		this.shaderRenderer = new THREE.WebGLRenderTarget(
			TEXTURE_WIDTH,
			TEXTURE_HEIGHT,
			{
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				generateMipmaps: false,
				stencilBuffer: true,
				depthBuffer: false,
				alpha: true,
				transparent: true,
				format: THREE.RGBAFormat,
			}
		)
		this.shaderRenderer.setSize(TEXTURE_WIDTH, TEXTURE_HEIGHT)
		textureCamera = new THREE.OrthographicCamera(
			TEXTURE_WIDTH / -2,
			TEXTURE_WIDTH / 2,
			TEXTURE_HEIGHT / 2,
			TEXTURE_HEIGHT / -2,
			-1000,
			100000
		)
		shaderScene = new THREE.Scene()

		if (preMadeCamera) {
			camera = preMadeCamera
		} else {
			camera = new THREE.PerspectiveCamera(
				40,
				SCREEN_WIDTH / SCREEN_HEIGHT,
				2,
				6000
			)
		}
		scene = new THREE.Scene()

		// this.setupShaderBuffer();

		// if( this.datgui ){
		//   this.datgui.add( camera.position, 'x', -200, 200 )
		//   .onFinishChange( ( val ) => {
		//     camera.position.x = val;
		//   });
		//   this.datgui.add( camera.position, 'y', -200, 200 )
		//   .onFinishChange( ( val ) => {
		//     camera.position.y = val;
		//   });
		//   this.datgui.add( camera.position, 'z', -200, 200 )
		//   .onFinishChange( ( val ) => {
		//     camera.position.z = val;
		//   });
		// }

		// SETUP MAIN WEBGL RENDERER
		// renderer = new THREE.WebGLRenderer({
		//   antialias: true,
		//   alpha: true,
		//   stencil: true,
		//   precision: 'highp'
		// });
		renderer = new THREE.WebGLRenderer()
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.shadowMap.enabled = true
		// add renderer to DOM
		document
			.getElementById(this.settings.elementId)
			.appendChild(renderer.domElement)

		// FPS counter
		if (this.settings.showStats) {
			this.stats = new Stats()
			document
				.getElementById(this.settings.elementId)
				.appendChild(this.stats.dom)
		}

		if (this.settings.controls === "orbit") {
			controls = new THREE.OrbitControls(camera)
			controls.rotateSpeed = 1.0
			controls.zoomSpeed = 1.2
			controls.panSpeed = 0.8
			controls.keys = [65, 83, 68]
		}

		// LINK EVENTS
		requestAnimationFrame(this.renderLoop.bind(this))
		window.addEventListener("resize", this.resize, false)
	}

	renderLoop() {
		if (!this.mounted) return
		let delta = this.baseClock.getDelta()

		TWEEN.update()
		if (this.stats) this.stats.update()
		if (this.controls) this.controls.update()

		renderer.render(shaderScene, textureCamera, this.shaderRenderer)
		if (this.postprocessing) {
			effectComposer.render(delta)
		} else {
			renderer.render(scene, camera)
		}

		// update shader unis
		if (this.bufferShaderMaterial && this.bufferShaderMaterial.uniforms) {
			this.bufferShaderMaterial.uniforms["iGlobalTime"].value =
				(Date.now() - this.start) / 1000
			this.bufferShaderMaterial.uniforms["t"].value =
				(Date.now() - this.start) / 1000
		}

		requestAnimationFrame(this.renderLoop.bind(this))
	}

	loadCollada(filepath, cb, startAnimations = true) {
		// var loader = new ColladaLoader2();
		let loader = new THREE.ColladaLoader()
		// let loader = new TCL();
		// let loader = new ColladaLoader();
		loader.options = {
			centerGeometry: true,
			defaultEnvMap: true,
			convertUpAxis: true,
		}

		loader.load(filepath, (obj) => {
			if (startAnimations) {
				obj.scene.traverse(function (child) {
					if (child instanceof THREE.SkinnedMesh) {
						var animation = new THREE.Animation(child, child.geometry.animation)
						animation.play()
					}
				})
			}
			if (cb) {
				cb.call(this, obj.scene)
			}
		})
	}

	startPostProcessing() {
		this.postprocessing = true

		effectComposer = new THREE.EffectComposer(renderer)
		let renderPass = new THREE.RenderPass(scene, camera)

		let bloomPass = new THREE.BloomPass(1, 25, 4.0, 256)
		let dotScreenPass = new THREE.DotScreenPass(
			new THREE.Vector2(0, 0),
			0.5,
			0.8
		)
		let copyPass = new THREE.ShaderPass(THREE.CopyShader)
		let filmPass = new THREE.FilmPass(0.5, 0.045, 500, false)
		let BokehPass = new THREE.BokehPass(scene, camera, {
			focus: 1.0,
			aperture: 0.0025,
			maxblur: 4.0,
		})

		copyPass.renderToScreen = true

		effectComposer.addPass(renderPass)
		// effectComposer.addPass(bloomPass)
		// effectComposer.addPass(dotScreenPass)
		effectComposer.addPass(filmPass)
		// effectComposer.addPass(BokehPass);
		effectComposer.addPass(copyPass)
	}

	resize() {
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
	}

	setVisionProperties(properties) {
		this.visionPresets = properties
	}

	buildScene() {}

	buildTestGeo() {
		let boxMaterial = new THREE.MeshLambertMaterial({
			map: this.shaderRenderer.texture,
			wireframe: false,
			color: "rgb(200, 100, 100)",
			depthWrite: false,
			depthTest: false,
			opacity: 1,
		})
		let boxGeometry2 = new THREE.PlaneGeometry(100, 100, 2)
		let mainBoxObject = new THREE.Mesh(boxGeometry2, boxMaterial)
		camera.add(mainBoxObject)
		mainBoxObject.position.set(-80, 0, -160)
		mainBoxObject.lookAt(camera.position)
	}

	setupShaderBuffer() {
		this.bufferShaderMaterial = new THREE.ShaderMaterial({
			side: THREE.DoubleSide,
			transparent: true,
			depthWrite: false,
			wireframe: false,
			fragmentShader: document.getElementById("etherFragment").textContent,
			uniforms: {
				time: { type: "f", value: 0.0 },
				t: { type: "f", value: 0.0 },
				iGlobalTime: { type: "i", value: 0 },
				iResolution: { type: "vec3", value: [0, TEXTURE_SIZE * 0.7, 0] },
			},
		})
		let geo = new THREE.PlaneGeometry(TEXTURE_WIDTH, TEXTURE_HEIGHT)
		let mesh = new THREE.Mesh(geo, this.bufferShaderMaterial)

		shaderScene.add(mesh)
		shaderScene.add(textureCamera)
		mesh.position.x = 0
		mesh.position.y = 0
		mesh.position.z = -50
		textureCamera.lookAt(mesh.position)
		mesh.lookAt(textureCamera.position)
	}

	loadTestScene() {
		let ambientLight = new THREE.AmbientLight(
			new THREE.Color("rgb(255, 255, 255)"),
			0.5
		)
		let light = new THREE.PointLight(0xffffff, 1, 0)
		light.position.set(50, 50, 500)
		scene.add(ambientLight)
		scene.add(light)
		scene.add(camera)

		var geometry = new THREE.BoxGeometry(1, 1, 1)
		var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
		var cube = new THREE.Mesh(geometry, material)
		scene.add(cube)

		camera.position.set(0, -150, 160)
		// camera.lookAt( 0,0,0 );
	}
	makeRandomSphere() {
		let variance = 100
		var geometry = new THREE.SphereGeometry(
			Math.random() * (variance / 2),
			50,
			50
		)
		var material = new THREE.MeshLambertMaterial({ color: 0x1010ee })
		var sphere = new THREE.Mesh(geometry, material)
		sphere.position.set(
			Math.random() * variance - variance / 2,
			Math.random() * variance - variance / 2,
			Math.random() * variance - variance / 2
		)
		return sphere
	}

	get renderer() {
		return renderer
	}
	get scene() {
		return scene
	}
	get camera() {
		return camera
	}

	render() {
		return (
			<div
				className='basescene-component'
				id='basescene-component'
			></div>
		)
	}
}

BaseSceneComponent.showStats = false

export default BaseSceneComponent
