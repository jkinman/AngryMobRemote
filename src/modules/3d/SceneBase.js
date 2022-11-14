import * as THREE from "three"
import * as CameraTools from "../DeviceCameraTools"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

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

		this.camera = new THREE.PerspectiveCamera(
			70,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		)
		this.scene = new THREE.Scene()
		this.renderer = new THREE.WebGLRenderer({ alpha: true })
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(window.innerWidth, window.innerHeight)

		// renderer.shadowMap.enabled = false
		// add renderer to DOM
		const el = document.createElement("div")
		document.body.appendChild(el)
		el.className = "threed-canvas"
		el.appendChild(this.renderer.domElement)

		// LINK EVENTS
		requestAnimationFrame(() => this.renderLoop())
		window.addEventListener("resize", () => this.resize(), false)

		const light = new THREE.AmbientLight(0x404040, 0.5) // soft white light
		this.scene.add(light)

		this.camera.position.set(0, 0, 50)
		this.camera.lookAt(0, 0, 0)

		const geometry = new THREE.BoxGeometry(10, 20, 2)
		const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
		this.cube = new THREE.Mesh(geometry, material)
    this.cube.on('click', () => this.cubeClicked = ! this.cubeClicked);
		this.scene.add(this.cube)

		this.scene.add(this.makePointLight())
		this.scene.add(this.wireframeSphere())

    this.loadCamera()
	}
  
	loadCamera() {
		this.loadGltf("1930s_movie_camera/scene.gltf").then(
			(gltf) => {
				const obj = gltf.scene
				obj.scale.set(0.1, 0.1, 0.1)
				obj.position.set(-20, 5, 10)
				this.scene.add(obj)
        this.cameraModel = obj
			},
			console.log,
			(error) => {
				console.error(error)
			}
		)
	}

  loadGlobe() {
		const model = this.loadGltf("props_-_scifi_globe/scene.gltf").then(
			(gltf) => {
				const obj = gltf.scene
				obj.scale.set(1, 1, 1)
				obj.position.set(0, -2, 40)
				this.scene.add(obj)
			},
			console.log,
			(error) => {
				console.error(error)
			}
		)
	}

	loadGltf(path) {
		const loader = new GLTFLoader()
		return new Promise((resolve) => {
			loader.load(path, resolve)
		})
	}

	updateData(data) {
		// debugger
		this.data = data
	}

	renderLoop() {
		let delta = this.baseClock.getDelta()
		if (this.data.beta) {
      if(this.cubeClicked){
        CameraTools.cameraRotate(this.data, this.cube)

      }else{

        CameraTools.cameraRotate(this.data, this.camera)
      }
      // if( this.cameraModel)
			// CameraTools.cameraRotate(this.data, this.cameraModel)
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
		this.renderer.render(this.scene, this.camera)
		// }

		// update shader unis
		// if( this.bufferShaderMaterial && this.bufferShaderMaterial.uniforms ){
		//   this.bufferShaderMaterial.uniforms[ 'iGlobalTime' ].value = (Date.now() - this.start) / 1000;
		//   this.bufferShaderMaterial.uniforms[ 't' ].value = (Date.now() - this.start) / 1000;
		// }

		requestAnimationFrame(() => this.renderLoop())
	}

	makePointLight() {
		const plight = new THREE.PointLight(0xffffff, 1, 100)
		plight.position.set(10, 10, 10)
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
    line.material.color.setHex(0x0000FF)
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
