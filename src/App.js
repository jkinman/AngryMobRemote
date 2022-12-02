import React, { useEffect, useContext } from "react"
import "./style/App.scss"
// import AngryMob from "./pages/AngryMob"
import Render3d from "./dumb/Render3d"
import MainLayout from "./pages/MainLayout"
import ControllerLayout from "./pages/ControllerLayout"

// contexts
import { DeviceMetricsContext } from "./contexts/DeviceMetricsContext"
import { RTCContext } from "./contexts/RTCContext"
import { AppContext } from "./contexts/AppContext"

// components
import UplinkComponent from "./smart/UplinkComponent"
import DeviceMetrics from "./smart/DeviceMetrics"
import CyberpunkModal from "./dumb/CyberPunkModal"

import ConnectionStatus from "./dumb/ConnectionStatus"

function App() {
	const RTCState = useContext(RTCContext)
	const DeviceState = useContext(DeviceMetricsContext)
	const AppState = useContext(AppContext)
	useEffect(() => {
		let params = new URL(document.location).searchParams
		if (params.has("id")) {
			AppState.setRTCId(params.get("id"))
		} else {
			AppState.setIsClient(true)
		}
		if (params.has("controls"))
			AppState.setShow3DControls(params.get("controls"))
	}, [document.location])

	return (
		<div>
			<CyberpunkModal
				show={AppState.showAbout}
				close={AppState.toggleAbout}
			>
				<>
					<h1>About this app</h1>
					<h2>uplink access point</h2>
					<p>
						Scan the uplink access point QR code on your mobile to unlock the
						full demo.
					</p>
					<p>100% static React app zero server side code.</p>
					<h2>tech details</h2>
					<p>A few things to note:</p>
					<ul>
						<li>
							This demo is completly static, there is no server side code
							running.{" "}
						</li>
						<li>All communication is done peer to peer.</li>
						<li>All graphics are rendered in realtime. </li>
					</ul>
					<span>
						After linking a mobile device by scanning the QR code the device's
						orientation is linked to the scene's camera. I dropped the tech into
						a Synthwave / Vaporwave edge runner scene I made cus it looks DOPE!
					</span>
				</>
			</CyberpunkModal>

			<CyberpunkModal
				show={AppState.showCV}
				close={AppState.toggleCV}
			>
				<>
					<h1>My resume</h1>
					<div className="resume">
					<object
						data='./Joel Kinman resume.pdf'
						type='application/pdf'
						width='100%'
						height='100%'
					>
						<p>
							Your web browser doesn't have a PDF plugin.
							<a href='./Joel Kinman resume.pdf'>click here to download the PDF file.</a>
						</p>
					</object>
					</div>
				</>
			</CyberpunkModal>

			{/* This is the remote display */}
			{AppState.isRemote && (
				<ControllerLayout
					showQR={false}
					RTCId={AppState.RTCId}
					leftTop={<ConnectionStatus {...RTCState} />}
				>
					<DeviceMetrics />
					<UplinkComponent deviceState={DeviceState} />
				</ControllerLayout>
			)}

			{/* This is the 3D client scene */}
			{AppState.isClient && (
				<>
					<MainLayout
						leftMid={<ConnectionStatus {...RTCState} />}
						// leftTop={<ConnectionStatus {...RTCState} />}
						connected={RTCState.peerConnection}
						aboutHandler={() => AppState.toggleAbout()}
						cvHandler={() => AppState.toggleCV()}
					>
						{/* <h2>Joel Kinman</h2> */}
						{/* <div className='infobox'>
					<p>Connect a mobile device by scanning the uplink access point.</p>
					<p>This creates a peer to peer communication socket via WebRTC.</p>
				</div> */}
					</MainLayout>
				</>
			)}
			<Render3d
				RTCState={RTCState}
				isClient={AppState.isClient}
				storeDataCallback={RTCState.storeDataCallback}
				x
				showControls={AppState.show3DControls}
				dimScene={AppState.showAbout}
			/>
			{/* <DeviceMetrics /> */}
		</div>
	)
}

export default App
