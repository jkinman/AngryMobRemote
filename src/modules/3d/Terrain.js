import * as THREE from "three"
import Delaunator from 'delaunator'

class Terrain {
	constructor() {}
	static generateGeometry(visibleWidth = 100) {
		let points3d = []
		var variance = THREE.MathUtils.randFloat(1, 10)
		// generate 1024 verticies (32 * 32)
		for (let i = 1; i < 33; i++) {
			for (let j = 1; j < 33; j++) {
				// width/height of screen / 32 segents * index / 5 (used to scale the mesh. Larger values = smaller mesh)
				let x = (visibleWidth / 32) * i + THREE.MathUtils.randFloatSpread(variance)
				let z = (visibleWidth / 32) * j + THREE.MathUtils.randFloatSpread(variance)
				let y = THREE.MathUtils.randFloatSpread(4)
				points3d.push(new THREE.Vector3(x, y, z))
			}
		}

		var geometry1 = new THREE.BufferGeometry().setFromPoints(points3d)

		// add faces
		var indexDelaunay = Delaunator.from(
			points3d.map((v) => {
				return [v.x, v.z]
			})
		)

		// delaunay index => three.js index
		var meshIndex = []
		for (let i = 0; i < indexDelaunay.triangles.length; i++) {
			meshIndex.push(indexDelaunay.triangles[i])
		}

		// add three.js index to the existing geometry
		geometry1.setIndex(meshIndex)
		geometry1.computeVertexNormals()

		// get the geometry points using attributes.position.count
		const count = geometry1.attributes.position.count
		// assign a color attribute to geometry points
		geometry1.setAttribute(
			"color",
			new THREE.BufferAttribute(new Float32Array(count * 3), 3)
		)

        var mesh = new THREE.Mesh(
        geometry1,
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          opacity: 1,
          vertexColors: true,
          flatShading: true,
          shininess: 30
        })
      )

      return mesh
	}

}

export default Terrain