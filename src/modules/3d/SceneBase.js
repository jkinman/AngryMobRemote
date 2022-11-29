import * as THREE from "three"
import * as CameraTools from "../DeviceCameraTools"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "lil-gui"

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"

import theme from "../../style/_vars.scss"

import * as AssetLoader from "./AssetLoaders"
import * as VaporwaveGenerator from "./Vaporwave"

// consts
const TEXTURE_SIZE = 1024
const TEXTURE_HEIGHT = TEXTURE_SIZE
const TEXTURE_WIDTH = TEXTURE_SIZE
// let renderer, this.scene, camera, this.baseClock

class SceneBase {
	constructor() {
		this.gui = new dat.GUI()

		this.baseClock = new THREE.Clock()
		this.data = {}
		const SCREEN_WIDTH = window.innerWidth
		const SCREEN_HEIGHT = window.innerHeight

		// Scene
		// fog colour theme.themeColour3
		this.scene = new THREE.Scene()
		this.scene.fog = new THREE.Fog('#000000', 0, 1)
		// this.scene.background = new THREE.CubeTextureLoader()
		// 	.setPath("cube/")
		// 	.load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"])
		// this.scene.background = new THREE.CubeTextureLoader()
		// 	.setPath("synthwave-cube-night/")
		// 	.load(["1.png", "3.png", "5.png", "6.png", "4.png", "2.png"])
		// Camera setup
		this.camera = new THREE.PerspectiveCamera(
			100,
			window.innerWidth / window.innerHeight,
			0.01,
			1000
		)
		this.camera.position.set(0, 0.04, 0.05)
		this.camera.lookAt(0, 10.1, 0)

		this.renderer = new THREE.WebGLRenderer({
			powerPreference: "high-performance",
			antialias: false,
			stencil: false,
			depth: false,
		})
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		// this.renderer.setClearColor(0xffffff, 0)
		// this.interaction = new Interaction(this.renderer, this.scene, this.camera);

		this.renderer.shadowMap.enabled = true
		// add renderer to DOM
		const el = document.createElement("div")
		document.body.appendChild(el)
		el.className = "threed-canvas"
		el.appendChild(this.renderer.domElement)

		// LINK EVENTS
		requestAnimationFrame(() => this.renderLoop())
		window.addEventListener("resize", () => this.resize(), false)

		// this.loadD20()
		// this.loadMobile()
		// this.loadCamera()
		// this.loadMystical_forest_cartoon()
		// this.loadWarehouse()
		// this.loadRoom()
		// this.loadScifiRoom()
		// this.loadSofa()

		AssetLoader.loadScifiVehicle().then((car) => {
			this.car = car
			this.car.scale.set(0.01, 0.01, 0.01)
			car.rotateY(Math.PI)
			this.scene.add(car)
		})

		// const dLight = new THREE.DirectionalLight()
		// this.scene.add(dLight)

		// const axesHelper = new THREE.AxesHelper(10)
		// this.scene.add(axesHelper)

		// this.scene.add(this.makeGround())
		// this.scene.add(this.makeSun())
		this.scene.add(VaporwaveGenerator.makeVaporwaveScene(this.gui))
		// store the planes
		this.plane = this.scene.getObjectByName("vaporWaveGround1")
		this.plane2 = this.scene.getObjectByName("vaporWaveGround2")
		VaporwaveGenerator.addVaporwaveLights(this.scene, this.gui)
		this.enableCameraControls()
		this.setUpVaporwavePost(this.gui, this.renderer)
		VaporwaveGenerator.addCameraGui(this.gui, this.camera)
	}

	setUpVaporwavePost(gui, renderer) {
		const sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		}
		// Post-processing
		this.effectComposer = new EffectComposer(renderer)
		this.effectComposer.setSize(sizes.width, sizes.height)
		this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		const renderPass = new RenderPass(this.scene, this.camera)
		this.effectComposer.addPass(renderPass)

		const rgbShiftPass = new ShaderPass(RGBShiftShader)
		rgbShiftPass.uniforms["amount"].value = 0.001
		gui
			.add(rgbShiftPass.uniforms["amount"], "value")
			.min(0)
			.max(0.01)
			.step(0.00001)
			.name("RGBShift intensity")
		this.effectComposer.addPass(rgbShiftPass)
		const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
		this.effectComposer.addPass(gammaCorrectionPass)

		var bloomParams = {
			strength: 0.6,
		}

		const bloomPass = new UnrealBloomPass()
		bloomPass.strength = bloomParams.strength

		gui
			.add(bloomParams, "strength", 0.0, 3.0)
			.onChange((value) => {
				bloomPass.strength = Number(value)
			})
			.name("Bloom Strength")

		this.effectComposer.addPass(bloomPass)
	}

	enableCameraControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.enableDamping = true
		this.controls.update()
	}

	updateData(data) {
		// debugger
		this.data = data
	}

	renderLoop() {
		const delta = this.baseClock.getDelta()
		const elapsedTime = this.baseClock.getElapsedTime()
		// Update plane position
		this.plane.position.z = (elapsedTime * 0.15) % 2
		this.plane2.position.z = ((elapsedTime * 0.15) % 2) - 2

		if (this.groundTexture) {
			// debugger
			const offset = this.groundTexture.offset
			// console.log(offset, delta)
			offset.y = offset.y + 0.1
			this.groundTexture.offset.set(...offset)
			// this.groundTexture.needsUpdate.set(true)
		}
		if (this.data.beta) {
			// if (this.d20) CameraTools.cameraRotate(this.data, this.d20)
			// if (this.mobile) CameraTools.cameraRotate(this.data, this.mobile)
			// CameraTools.cameraRotate(this.data, this.cube)
			CameraTools.cameraRotate(this.data, this.camera)
			// CameraTools.cameraRotate(this.data, this.car)
			// if( this.cameraModel)
			// CameraTools.cameraRotate(this.data, this.cameraModel)
		} else {
			if (this.controls) this.controls.update()
		}

		// TWEEN.update();
		// if( this.stats ) this.stats.update();
		// if( this.controls ) this.controls.update();

		// renderer.render( shaderScene, textureCamera, this.shaderRenderer );
		// if( this.postprocessing ){
		//   effectComposer.render(delta);
		// }
		// else{

		// console.log(this.data)
		// this.renderer.render(this.scene, this.camera)
		this.effectComposer.render()

		// }

		// update shader unis
		// if( this.bufferShaderMaterial && this.bufferShaderMaterial.uniforms ){
		//   this.bufferShaderMaterial.uniforms[ 'iGlobalTime' ].value = (Date.now() - this.start) / 1000;
		//   this.bufferShaderMaterial.uniforms[ 't' ].value = (Date.now() - this.start) / 1000;
		// }

		requestAnimationFrame(() => this.renderLoop())
	}

	makePointLight() {
		const plight = new THREE.PointLight(0xffffff, 10, 100)
		plight.position.set(0, 5, 20)
		return plight
	}
	wireframeSphere() {
		const spgeometry = new THREE.SphereGeometry(300, 50, 50)
		const wireframe = new THREE.WireframeGeometry(spgeometry)
		const line = new THREE.LineSegments(wireframe)
		line.position.set(0, 0, 50)
		line.material.depthTest = true
		line.material.opacity = 1
		line.material.transparent = true
		line.material.color.setHex(0x0000ff)
		return line
	}

	resize() {
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.effectComposer.setSize(window.innerWidth, window.innerHeight)
		this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
	}
}

export default SceneBase
