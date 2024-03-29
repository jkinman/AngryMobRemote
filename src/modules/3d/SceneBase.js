import * as THREE from "three"
import * as CameraTools from "../DeviceCameraTools"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "lil-gui"
import Stats from "stats.js"

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass"

import theme from "../../style/_vars.scss"

import * as AssetLoader from "./AssetLoaders"
import * as VaporwaveGenerator from "./Vaporwave"

// consts
const TEXTURE_SIZE = 1024
const TEXTURE_HEIGHT = TEXTURE_SIZE
const TEXTURE_WIDTH = TEXTURE_SIZE
// let renderer, this.scene, camera, this.baseClock

class SceneBase {
	constructor(props = {}) {
		this.mounted = false
		this.baseClock = new THREE.Clock()
		this.data = {}
		// debugger
		this.setShowControls(props.showControls)
	}

	startUp(props = {}) {
		if (this.mounted) console.error("trying to mount scene multiple times")
		this.mounted = true
		// add FPS and gui
		this.stats = new Stats()
		this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
		const elfps = document.getElementById("fps")
		this.stats.dom.className = "fps"
		this.stats.dom.style = ""
		elfps.appendChild(this.stats.dom)
		this.gui = new dat.GUI()
		this.gui.close()
		this.setShowControls(this.showControls)

		const SCREEN_WIDTH = window.innerWidth
		const SCREEN_HEIGHT = window.innerHeight

		// Scene
		// fog colour theme.themeColour3
		this.scene = new THREE.Scene()
		// this.scene.fog = new THREE.Fog('#000000', 0, 1)
		this.scene.fog = new THREE.Fog(theme.themeColour5, 0.6, 1.6)

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

		// Camera setup
		this.camera = new THREE.PerspectiveCamera(
			110,
			window.innerWidth / window.innerHeight,
			0.01,
			1000
		)
		this.camera.position.set(0, 0.02, 0.047)
		this.camera.lookAt(0, 10.1, 0)

		this.renderer = new THREE.WebGLRenderer({
			// powerPreference: "low-power",
			powerPreference: "high-performance",
			antialias: false,
			stencil: false,
			depth: false,
		})
		// this.renderer.autoClear = true
		// this.renderer.autoClearColor = true
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(window.innerWidth, window.innerHeight)

		// add renderer to DOM
		const el = document.getElementById("threed-canvas")
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

		this.scene.add(
			VaporwaveGenerator.makeVaporwaveScene(this.gui.addFolder("terrain"))
		)
		// store the planes
		this.plane = this.scene.getObjectByName("vaporWaveGround1")
		this.plane2 = this.scene.getObjectByName("vaporWaveGround2")
		VaporwaveGenerator.addVaporwaveLights(
			this.scene,
			this.gui.addFolder("lights")
		)

		this.enableCameraControls()
		this.effectComposer = VaporwaveGenerator.setUpVaporwavePost(
			this.gui,
			this.renderer,
			this.camera,
			this.scene
		)
		VaporwaveGenerator.addCameraGui(this.gui, this.camera)

		// this.makeObject()

	}

	// loadD20 () {
	// 	const model = loadGltf("mesh/d20/scene.gltf").then(
	// 		(gltf) => {
	// 			const obj = gltf.scene
	// 			obj.scale.set(0.3, 0.3, 0.3)
	// 			obj.position.set(0, -30, -25)
	// 			this.scene.add(obj)
	// 			this.d20 = obj
	// 		},
	// 		console.log,
	// 		(error) => {
	// 			console.error(error)
	// 		}
	// 	)
	// }
	
	setShowControls(show) {
		this.showControls = show
		if (this.gui) {
			if (this.showControls) {
				this.gui.show()
			} else {
				this.gui.hide()
			}
		}
	}
	dimScene(dim) {}

	enableCameraControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.enableDamping = true
		this.controls.autoRotate = true
		this.controls.update()
	}

	updateData(data) {
		this.data = data
	}

	renderLoop() {
		this.stats.begin()
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
		if (this.data?.beta) {
			this.controls.autoRotate = false

			// if (this.d20) CameraTools.cameraRotate(this.data, this.d20())
			// if (this.mobile) CameraTools.cameraRotate(this.data, this.mobile)
			// CameraTools.cameraRotate(this.data, this.cube)
			CameraTools.cameraRotate(this.data, this.camera)
			// CameraTools.cameraRotate(this.data, this.car)
			// if( this.cameraModel)
			// CameraTools.cameraRotate(this.data, this.cameraModel)
		} else {
			if (this.controls) {
				this.controls.update()
				this.controls.autoRotate = true
			}

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
		if (this.effectComposer) this.effectComposer.render()
		else this.renderer.render(this.scene, this.camera)

		// }

		// update shader unis
		// if( this.bufferShaderMaterial && this.bufferShaderMaterial.uniforms ){
		//   this.bufferShaderMaterial.uniforms[ 'iGlobalTime' ].value = (Date.now() - this.start) / 1000;
		//   this.bufferShaderMaterial.uniforms[ 't' ].value = (Date.now() - this.start) / 1000;
		// }
		this.stats.end()
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
