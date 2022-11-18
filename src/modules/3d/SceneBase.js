import * as THREE from "three"
import * as CameraTools from "../DeviceCameraTools"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import {
	BloomEffect,
	EffectComposer,
	EffectPass,
	RenderPass,
	DepthOfFieldEffect,
} from "postprocessing" //https://pmndrs.github.io/postprocessing/public/docs/class/src/effects/DepthEffect.js~DepthEffect.html
// import { Interaction } from 'three.interaction';

import * as AssetLoader from "./AssetLoaders"
// consts
const TEXTURE_SIZE = 1024
const TEXTURE_HEIGHT = TEXTURE_SIZE
const TEXTURE_WIDTH = TEXTURE_SIZE
// let renderer, this.scene, camera, this.baseClock

class SceneBase {
	constructor() {
		this.cubeClicked = false
		this.baseClock = new THREE.Clock()
		this.data = {}
		const SCREEN_WIDTH = window.innerWidth
		const SCREEN_HEIGHT = window.innerHeight

		// Scene
		this.scene = new THREE.Scene()

		// Camera setup
		this.camera = new THREE.PerspectiveCamera(
			70,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		)
		this.camera.position.set(0, 4, 6)
		this.camera.lookAt(0, 0, 0)

		this.renderer = new THREE.WebGLRenderer({
			powerPreference: "high-performance",
			antialias: false,
			stencil: false,
			depth: false,
		})
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

		const light = new THREE.AmbientLight(0x404040, 0.8) // soft white light
		this.scene.add(light)

		const geometry = new THREE.BoxGeometry(10, 20, 2)
		const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
		this.cube = new THREE.Mesh(geometry, material)
		// this.cube.on('click', () => this.cubeClicked = ! this.cubeClicked);
		// this.scene.add(this.cube)

		const pointLight = this.makePointLight()
		const pointLightHelper = new THREE.PointLightHelper(pointLight, 5)
		this.scene.add(pointLight)
		this.scene.add(pointLightHelper)

		// this.scene.add(this.makePointLight())
		// this.scene.add(this.wireframeSphere())

		this.composer = new EffectComposer(this.renderer)
		this.composer.addPass(new RenderPass(this.scene, this.camera))
		// this.composer.addPass(
		// 	new EffectPass(this.camera, new DepthOfFieldEffect({}))
		// )
		this.composer.addPass(
			new EffectPass(this.camera, new BloomEffect({ intensity: 1 }))
		)

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
    car.rotateY(Math.PI)
      this.scene.add(car)
		})

		const dLight = new THREE.DirectionalLight()
		this.scene.add(dLight)

		const axesHelper = new THREE.AxesHelper(10)
		this.scene.add(axesHelper)

    this.scene.add(this.makeGround())
		// this.enableCameraControls()
	}

	makeGround() {
		// let geometry = new THREE.PlaneGeometry(2000, 2000, 256, 256)
		// let material = new THREE.MeshLambertMaterial({ color: 0x3c3951 })
		// let terrain = new THREE.Mesh(geometry, material)
    
    const geometry = new THREE.PlaneGeometry(250, 250, 100, 100)
		const wireframe = new THREE.WireframeGeometry(geometry)
		const terrain = new THREE.LineSegments(wireframe)
		terrain.rotation.x = -Math.PI / 2
		terrain.position.set(0, 0, 50)
		terrain.material.depthTest = true
		terrain.material.opacity = 1
		terrain.material.transparent = true
		terrain.material.color.setHex(0x0000ff)

		return terrain
	}

	enableCameraControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.update()
	}

	updateData(data) {
		// debugger
		this.data = data
	}

	renderLoop() {
		let delta = this.baseClock.getDelta()
		if (this.data.beta) {
			// if (this.d20) CameraTools.cameraRotate(this.data, this.d20)
			// if (this.mobile) CameraTools.cameraRotate(this.data, this.mobile)
			// CameraTools.cameraRotate(this.data, this.cube)
			CameraTools.cameraRotate(this.data, this.camera)
			// if( this.cameraModel)
			// CameraTools.cameraRotate(this.data, this.cameraModel)
		}
		// if (this.controls) this.controls.update()

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
		this.composer.render()
		// }

		// update shader unis
		// if( this.bufferShaderMaterial && this.bufferShaderMaterial.uniforms ){
		//   this.bufferShaderMaterial.uniforms[ 'iGlobalTime' ].value = (Date.now() - this.start) / 1000;
		//   this.bufferShaderMaterial.uniforms[ 't' ].value = (Date.now() - this.start) / 1000;
		// }

		requestAnimationFrame(() => this.renderLoop())
	}

	makePointLight() {
		const plight = new THREE.PointLight(0xffffff, 5, 100)
		plight.position.set(10, 20, 20)
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
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
	}
}

export default SceneBase
