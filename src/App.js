import React, { useEffect, useState } from "react"
import "./style/App.scss"
import Render3d from "./dumb/Render3d"
import MainLayout from "./pages/MainLayout"
import TerminalControllerLayout from "./pages/TerminalControllerLayout"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileArrowDown } from "@fortawesome/free-solid-svg-icons"
import ComputerAndMobile from './img/laptop+mobile.png'
import QRCode from "qrcode"
import theme from "./style/_vars.scss"

// Custom hooks
import { useApp, useRTC, useDeviceMetrics } from "./hooks"

// components
import TerminalDeviceMetrics from "./dumb/TerminalDeviceMetrics"
import UplinkComponent from "./smart/UplinkComponent"
import CyberpunkModal from "./dumb/CyberPunkModal"
import ConnectionStatus from "./dumb/ConnectionStatus"

function App() {
	const RTCState = useRTC()
	const DeviceState = useDeviceMetrics()
	const AppState = useApp()
	const [qrUrl, setQrUrl] = useState(null)

	// Set up RTC state transfer handler (once on mount)
	useEffect(() => {
		RTCState.setStateTransferHandler(AppState.stateTransfer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Parse URL parameters (once on mount)
	useEffect(() => {
		let params = new URL(document.location).searchParams
		if (params.has("id")) {
			AppState.setRTCId(params.get("id"))
			AppState.toggleIntro(false) // Don't show intro modal on mobile/remote
		} else {
			AppState.setIsClient(true)
		}
		if (params.has("controls"))
			AppState.setShow3DControls(!!params.get("controls"))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Generate QR code for intro modal
	useEffect(() => {
		if (!RTCState.peerId) return
		const qrLink = `${window.location.origin}?id=${RTCState.peerId}`
		QRCode.toDataURL(
			qrLink,
			{
				errorCorrectionLevel: "L",
				version: 5,
				type: "image/jpeg",
				quality: 0.5,
				margin: 1,
				color: {
					light: "#25f",
					dark: theme.themeColour1,
				},
			},
			(err, url) => {
				if (err) console.error(err)
				else setQrUrl(url)
			}
		)
	}, [RTCState.peerId])

	return (
		<div>
		{/* This is the remote display */}
		{AppState.isRemote && (
			<>
				<TerminalControllerLayout
					connectionStatus={RTCState.status}
					deviceId={RTCState.peerId}
					headlightsOn={AppState.headlightsOn}
					taillightsOn={AppState.taillightsOn}
					onToggleHeadlights={() => {
						console.log('Toggle headlights clicked, current:', AppState.headlightsOn)
						AppState.toggleHeadlights()
					}}
					onToggleTaillights={() => {
						console.log('Toggle taillights clicked, current:', AppState.taillightsOn)
						AppState.toggleTaillights()
					}}
				>
					<TerminalDeviceMetrics deviceState={DeviceState} />
				</TerminalControllerLayout>
				{/* Hidden component that handles WebRTC connection and data streaming */}
				<div style={{ display: 'none' }}>
					<UplinkComponent deviceState={DeviceState} />
				</div>
			</>
		)}

			{/* This is the 3D client scene */}
			{AppState.isClient && (
				<MainLayout
					leftMid={<ConnectionStatus {...RTCState} />}
					connected={RTCState.peerConnection}
					aboutHandler={() => {AppState.toggleAbout()}}
					cvHandler={() => AppState.toggleCV()}
				></MainLayout>
			)}
		<Render3d
			RTCState={RTCState}
			isClient={AppState.isClient}
			storeDataCallback={RTCState.storeDataCallback}
			showControls={AppState.show3DControls}
			dimScene={AppState.showAbout}
			headlightsOn={AppState.headlightsOn}
			taillightsOn={AppState.taillightsOn}
		/>
		<CyberpunkModal
			show={AppState.showAbout}
			close={AppState.toggleAbout}
		>
			<>
				<h1>About This Demo</h1>

				<p>
					Turn your phone into a wireless gyroscopic controller for this 3D scene. 
					Your device's accelerometer streams orientation data over a peer-to-peer 
					WebRTC connection—no servers, no backend, just pure client-side JavaScript.
				</p>

				<h2>How It Works</h2>
				<p>
					Scan the QR code with your mobile device to establish a direct WebRTC connection. 
					Your phone's orientation (alpha, beta, gamma) is converted to quaternion-based 
					camera rotation at 60 FPS with sub-frame latency.
				</p>

				<h2>Tech Stack</h2>
				<ul>
					<li>Three.js for real-time WebGL rendering</li>
					<li>WebRTC DataChannel for P2P communication</li>
					<li>Device Orientation API for gyroscope data</li>
					<li>React + SASS for the UI</li>
				</ul>
			</>
		</CyberpunkModal>

		<CyberpunkModal
			show={AppState.showIntro}
			close={AppState.toggleIntro}
		>
			<>
				<h1>Welcome</h1>
				<p>
					Turn your phone into a wireless gyroscopic controller for this 3D scene. 
					Your device's orientation data is streamed over a peer-to-peer WebRTC connection 
					and converted to quaternion-based camera rotation.
				</p>
				<div style={{ textAlign: 'center', margin: '1em 0' }}>
					<img src={ComputerAndMobile} alt="Computer and mobile device" width="160px"/>
				</div>

				<h2>How to Use</h2>
				<p>
					<strong>Desktop:</strong> Click and drag to orbit, scroll to zoom.
				</p>
				<p>
					<strong>Mobile:</strong> Scan the QR code to connect, enable device sensors, 
					and control the camera with your phone's gyroscope.
				</p>
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
