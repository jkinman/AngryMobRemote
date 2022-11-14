import * as THREE from "three"
import React, { Suspense, useRef, useState } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import {
	EffectComposer,
	DepthOfField,
	Bloom,
	Noise,
	Vignette,
} from "@react-three/postprocessing"
import {
	Html,
	Icosahedron,
	useTexture,
	useCubeTexture,
	MeshDistortMaterial,
	Plane,
	Sphere,
	Cylinder,
	OrbitControls,
	Environment,
	useGLTF,
} from "@react-three/drei"
import { presetsObj } from "@react-three/drei/helpers/environment-assets"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

// custom
import FxSW from "../modules/grfx/FxSW"
import * as CameraTools from "../modules/DeviceCameraTools"

function MainSphere({ material }) {
	const main = useRef()
	// main sphere rotates following the mouse position
	useFrame(({ clock, mouse }) => {
		main.current.rotation.z = clock.getElapsedTime()
		main.current.rotation.y = THREE.MathUtils.lerp(
			main.current.rotation.y,
			mouse.x * Math.PI,
			0.1
		)
		main.current.rotation.x = THREE.MathUtils.lerp(
			main.current.rotation.x,
			mouse.y * Math.PI,
			0.1
		)
	})
	return (
		<Icosahedron
			args={[1, 4]}
			ref={main}
			material={material}
			position={[0, 0, 0]}
		/>
	)
}

// const camera = () => {
// 	useFrame(() => {
//   })

//   return(
//     <></>
//   )
// }

function Instances({ material }) {
	// we use this array ref to store the spheres after creating them
	const [sphereRefs] = useState(() => [])
	// we use this array to initialize the background spheres
	const initialPositions = [
		[-4, 20, -12],
		[-10, 12, -4],
		[-11, -12, -23],
		[-16, -6, -10],
		[12, -2, -3],
		[13, 4, -12],
		[14, -2, -23],
		[8, 10, -20],
	]
	// smaller spheres movement
	useFrame(() => {
		// animate each sphere in the array
		sphereRefs.forEach((el) => {
			el.position.y += 0.02
			if (el.position.y > 19) el.position.y = -18
			el.rotation.x += 0.06
			el.rotation.y += 0.06
			el.rotation.z += 0.02
		})
	})
	return (
		<>
			<MainSphere material={material} />
			{initialPositions.map((pos, i) => (
				<Icosahedron
					args={[1, 4]}
					position={[pos[0], pos[1], pos[2]]}
					material={material}
					key={i}
					ref={(ref) => (sphereRefs[i] = ref)}
				/>
			))}
		</>
	)
}

const BrassKnuckles = (props) => {
	// const deviceOrientation = props.deviceMotionData
	const gltf = useLoader(GLTFLoader, "/brass_knuckles/scene.gltf")
	const myMesh = React.useRef()
	// useFrame((state) => {
	// 	if (deviceOrientation.alpha) {
	// 		CameraTools.cameraRotate(deviceOrientation, myMesh.current)
	// 	}
	// })
	return (
		<primitive
			name='BrassKnuckles'
			ref={myMesh}
			object={gltf.scene}
			scale={[100, 100, 100]}
		/>
	)
}

function Scene(props) {
	// const deviceOrientation = props.deviceMotionData
	const bumpMap = useTexture("/bump.jpg")
	const envMap = useCubeTexture(
		["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
		{ path: "/cube/" }
	)
	// We use `useResource` to be able to delay rendering the spheres until the material is ready
	const [material, set] = useState()

	// useFrame((state) => {
	// 	if (deviceOrientation.alpha) {
	// 		CameraTools.cameraRotate(deviceOrientation, state.camera)
	// 	}
	// })

	return (
		<>
			<MeshDistortMaterial
				ref={set}
				envMap={envMap}
				bumpMap={bumpMap}
				color={"#010101"}
				roughness={0.001}
				metalness={1}
				bumpScale={0.005}
				clearcoat={1}
				clearcoatRoughness={1}
				radius={1}
				distort={0.4}
			/>
			{material && <Instances material={material} />}
		</>
	)
}

function Box(props) {
	// This reference gives us direct access to the THREE.Mesh object
	const ref = useRef()
	// Hold state for hovered and clicked events
	const [hovered, hover] = useState(false)
	const [clicked, click] = useState(false)
	// Subscribe this component to the render-loop, rotate the mesh every frame
	// useFrame((state, delta) => (ref.current.rotation.x += 0.01))
	useFrame((state) => {
		if (props.deviceMotionData.alpha) {
			CameraTools.cameraRotate(props.deviceMotionData, ref.current)
		}
	})

	// Return the view, these are regular Threejs elements expressed in JSX
	return (
		<mesh
			position={props.position}
			ref={ref}
			scale={clicked ? 1.5 : 1}
			onClick={(event) => click(!clicked)}
			onPointerOver={(event) => hover(true)}
			onPointerOut={(event) => hover(false)}
		>
			<boxGeometry args={[10, 20, 2]} />
			<meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
		</mesh>
	)
}

export default function AngryMob(props) {
	return (
		<Canvas
			className='threed-canvas'
			// colorManagement
			camera={{ fov: 80, position: [0, 0, 5] }}
			gl={{
				powerPreference: "high-performance",
				alpha: false,
				antialias: false,
				stencil: false,
				depth: false,
			}}
		>
			<color
				attach='background'
				args={["#fff"]}
			/>
			{/* <fog
				color='#161616'
				attach='fog'
				near={8}
				far={100}
			/> */}
			<Suspense fallback={<Html center>Loading.</Html>}>
				{/* <Scene  /> */}
				{/* <BrassKnuckles deviceMotionData={props.deviceMotionData} /> */}
				<pointLight position={[10, 10, 10]} />
				<Box position={[0, 0, -20]} deviceMotionData={props.deviceMotionData}/>
				{/* <Cylinder args={[50, 50, 50, 32]}>
					<meshBasicMaterial
						color='green'
						side={THREE.DoubleSide}
					/>
				</Cylinder> */}
				{/* <Lights /> */}
				<ambientLight intensity={0.1} />
			</Suspense>
			{/* <OrbitControls
				enableZoom={true}
				enablePan={false}
				minPolarAngle={Math.PI / 2}
				maxPolarAngle={Math.PI / 2}
			/> */}
			{/* <Environment preset={"dawn"} /> */}
			{/* https://github.com/pmndrs/drei/blob/master/src/helpers/environment-assets.ts */}

			{/* <FxSW /> */}
			{/* <EffectComposer
				multisampling={0}
				disableNormalPass={true}
			>
				<DepthOfField
					focusDistance={0}
					focalLength={3}
					bokehScale={2}
					height={480}
				/>
				<Bloom
					luminanceThreshold={0}
					luminanceSmoothing={0.9}
					height={300}
					opacity={0.3}
				/>
				<Noise opacity={0.01} />
				<Vignette
					eskil={false}
					offset={0.1}
					darkness={0.5}
				/>
			</EffectComposer> */}
		</Canvas>
	)
}
