import React, { useEffect, useContext } from "react"
import "./style/App.scss"
// import AngryMob from "./pages/AngryMob"
import Render3d from "./dumb/Render3d"
import MainLayout from "./pages/MainLayout"
import ControllerLayout from "./pages/ControllerLayout"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileArrowDown } from "@fortawesome/free-solid-svg-icons"
import ComputerAndMobile from './img/laptop+mobile.png'
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
	// useEffect(()=>{
	// 	RTCState.setStateTransferHandler(AppState.stateTransfer)
	// }, [ ])
	useEffect(() => {
		let params = new URL(document.location).searchParams
		if (params.has("id")) {
			AppState.setRTCId(params.get("id"))
		} else {
			AppState.setIsClient(true)
		}
		if (params.has("controls"))
			AppState.setShow3DControls(!!params.get("controls"))
	}, [AppState])

	return (
		<div>
			{/* This is the remote display */}
			{AppState.isRemote && (
				<ControllerLayout
					showQR={false}
					RTCId={AppState.RTCId}
					leftTop={<ConnectionStatus {...RTCState} />}
					aboutHandler={() => {AppState.toggleAbout()}}
					cvHandler={() => AppState.toggleCV()}
			>
				<h1>controller</h1>
					<DeviceMetrics />
				<p>This is companion app controls aspects of the app's main module.</p><p>The orientation of your device's accelerometer should be linked the 3D scene's camera.</p>
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
						aboutHandler={() => {AppState.toggleAbout()}}
						cvHandler={() => AppState.toggleCV()}
					></MainLayout>
				</>
			)}
			<Render3d
				RTCState={RTCState}
				isClient={AppState.isClient}
				storeDataCallback={RTCState.storeDataCallback}
				showControls={AppState.show3DControls}
				dimScene={AppState.showAbout}
			/>
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
					<h2>tech details</h2>
					<p>A few things to note:</p>
					<ul>
						<li>
							This demo is completly static, no server side code needed
						</li>
						<li>All communication is done peer to peer</li>
						<li>All graphics are rendered in realtime</li>
					</ul>
					<span>
						After linking, the 3D scene's camera is updated in realtime with the device's orientation. I dropped the tech into
						this Vaporwave scene I coded for fun.
					</span>
				</>
			</CyberpunkModal>

			<CyberpunkModal
				show={AppState.showIntro}
				close={AppState.toggleIntro}
			>
				<>
					<h1>Intro</h1>
					<p>This is optimized to be run on a computer with a mobile phone companion.</p>
					<img src={ComputerAndMobile} width="200px"/>
					<h2>3D Scene</h2>
					<p>You can orbit the camera by clicking and dragging your mouse or finger anywhere on the scene, scrolling will change the camera zoom</p>
					<h2>to unlock the controller</h2>
					<span>
						Scan the uplink access point QR code on your mobile to unlock the
						full demo. (Just like a menu at a restaurant)
					</span>
				</>
			</CyberpunkModal>

			<CyberpunkModal
				show={AppState.showCV}
				close={AppState.toggleCV}
			>
				<>
					<h1>
						<a
							target='_blank'
							href='./Joel Kinman resume.pdf'
						>
							save pdf <FontAwesomeIcon icon={faFileArrowDown} />
						</a>
					</h1>
					<div className='resume'>
						<object
							data='./Joel Kinman resume.pdf'
							type='application/pdf'
							width='90%'
							height='90%'
						>
							<p>
								Your web browser doesn't have a PDF plugin.
								<a href='./Joel Kinman resume.pdf'>
									click here to download the PDF file.{" "}
									<FontAwesomeIcon icon={faFileArrowDown} />
								</a>
							</p>
						</object>
					</div>
				</>
			</CyberpunkModal>
		</div>
	)
}

export default App
