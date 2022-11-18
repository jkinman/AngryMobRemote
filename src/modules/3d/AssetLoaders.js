import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

export const loadGltf = (path) => {
    const loader = new GLTFLoader()
    return new Promise((resolve) => {
        loader.load(path, resolve)
    })
}

export const loadScifiVehicle = () => {
     return loadGltf(
        "mesh/sci-fi_vehicle_007_-_public_fomain/scene.gltf"
    ).then(
        (gltf) => {
            const obj = gltf.scene
            // obj.scale.set(.2, .2, .2)
            // obj.position.set(0, 0, 10)
            // this.scene.add(obj)
            // this.scifiVehicle = obj
            return obj
        },
        console.log,
        (error) => {
            console.error(error)
        }
    )
}

export const loadSofa = () => {
	const model = loadGltf(
		"mesh/leather_buttoned_sofa_low_v2/scene.gltf"
	).then(
		(gltf) => {
			const obj = gltf.scene
			obj.scale.set(0.2, 0.2, 0.2)
			// obj.position.set(0, 0, 10)
			this.scene.add(obj)
			this.room = obj
		},
		console.log,
		(error) => {
			console.error(error)
		}
	)
}
export const loadScifiRoom = () => {
	const model = loadGltf("mesh/sci-fi_corridor/scene.gltf").then(
		(gltf) => {
			const obj = gltf.scene
			// obj.scale.set(3, 3, 3)
			// obj.position.set(0, 0, 10)
			this.scene.add(obj)
			this.room = obj
		},
		console.log,
		(error) => {
			console.error(error)
		}
	)
}

export const loadRoom = () => {
	const model = loadGltf("mesh/the_room/scene.gltf").then(
		(gltf) => {
			const obj = gltf.scene
			// obj.scale.set(3, 3, 3)
			// obj.position.set(0, 0, 10)
			this.scene.add(obj)
			this.room = obj
		},
		console.log,
		(error) => {
			console.error(error)
		}
	)
}

export const loadWarehouse = () => {
	const model = loadGltf(
		"mesh/abandoned_warehouse_-_interior_scene/scene.gltf"
	).then(
		(gltf) => {
			const obj = gltf.scene
			obj.scale.set(3, 3, 3)
			obj.position.set(0, 0, 10)
			this.scene.add(obj)
			this.warehouse = obj
		},
		console.log,
		(error) => {
			console.error(error)
		}
	)
}

export const loadD20 = () => {
	const model = loadGltf("mesh/d20/scene.gltf").then(
		(gltf) => {
			const obj = gltf.scene
			obj.scale.set(0.3, 0.3, 0.3)
			obj.position.set(0, -30, -25)
			this.scene.add(obj)
			this.d20 = obj
		},
		console.log,
		(error) => {
			console.error(error)
		}
	)
}

export const loadMobile = () => {
	const model = loadGltf("mesh/low_poly_mobile_phone/scene.gltf").then(
		(gltf) => {
			const obj = gltf.scene
			obj.scale.set(30, 30, 30)
			// obj.position.set(0, -30, -25)
			this.scene.add(obj)
			this.mobile = obj
		},
		console.log,
		(error) => {
			console.error(error)
		}
	)
}

export const loadMystical_forest_cartoon = () => {
	const model = loadGltf("mesh/mystical_forest_cartoon/scene.gltf").then(
		(gltf) => {
			const obj = gltf.scene
			obj.scale.set(0.1, 0.1, 0.1)
			obj.position.set(0, -10, 0)
			this.scene.add(obj)
			console.log(obj)
		},
		console.log,
		(error) => {
			console.error(error)
		}
	)
}

export const loadCamera = () => {
	loadGltf("1930s_movie_camera/scene.gltf").then(
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

export const loadGlobe = () => {
	const model = loadGltf("props_-_scifi_globe/scene.gltf").then(
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

export default loadGltf
