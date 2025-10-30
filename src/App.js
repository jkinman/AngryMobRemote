import React, { useEffect, useState } from "react"
import "./style/App.scss"
import Render3d from "./dumb/Render3d"
import MainLayout from "./pages/MainLayout"
import TerminalControllerLayout from "./pages/TerminalControllerLayout"
import theme from "./style/_vars.scss"

// Custom hooks
import { useApp, useRTC, useDeviceMetrics } from "./hooks"

// Components
import TerminalDeviceMetrics from "./dumb/TerminalDeviceMetrics"
import UplinkComponent from "./smart/UplinkComponent"
import StateBroadcaster from "./smart/StateBroadcaster"
import ConnectionStatus from "./dumb/ConnectionStatus"

// Modal components
import AboutModal from "./components/modals/AboutModal"
import IntroModal from "./components/modals/IntroModal"
import ResumeModal from "./components/modals/ResumeModal"

// Utilities
import { generateQRCode } from "./utils/qrCodeGenerator"
import { parseAppParams } from "./utils/urlParams"

function App() {
	const RTCState = useRTC()
	const DeviceState = useDeviceMetrics()
	const AppState = useApp()
	// QR code URL state - currently unused but kept for future QR display feature
	// eslint-disable-next-line no-unused-vars
	const [qrUrl, setQrUrl] = useState(null)

	// Set up RTC state transfer handler (once on mount)
	useEffect(() => {
		RTCState.setStateTransferHandler(AppState.stateTransfer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Parse URL parameters (once on mount)
	useEffect(() => {
		const { rtcId, isClient, show3DControls } = parseAppParams()
		
		if (rtcId) {
			AppState.setRTCId(rtcId)
			AppState.toggleIntro(false) // Don't show intro modal on mobile/remote
		} else if (isClient) {
			AppState.setIsClient(true)
		}
		
		if (show3DControls !== undefined) {
			AppState.setShow3DControls(show3DControls)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Generate QR code for intro modal
	useEffect(() => {
		if (!RTCState.peerId) return
		
		generateQRCode(RTCState.peerId, theme)
			.then(url => setQrUrl(url))
			.catch(err => console.error("Failed to generate QR code:", err))
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
			<>
				<MainLayout
					leftMid={<ConnectionStatus {...RTCState} />}
					connected={RTCState.peerConnection}
					aboutHandler={() => {AppState.toggleAbout()}}
					cvHandler={() => AppState.toggleCV()}
				></MainLayout>
				{/* Hidden component that broadcasts state changes to connected remotes */}
				<StateBroadcaster />
			</>
		)}
		<Render3d
			RTCState={RTCState}
			isClient={AppState.isClient}
			storeDataCallback={RTCState.storeDataCallback}
			showControls={AppState.show3DControls}
			dimScene={AppState.showAbout}
			headlightsOn={AppState.headlightsOn}
			taillightsOn={AppState.taillightsOn}
			onHeadlightsChange={(value) => AppState.toggleHeadlights(value)}
			onTaillightsChange={(value) => AppState.toggleTaillights(value)}
		/>
		
		<AboutModal show={AppState.showAbout} onClose={AppState.toggleAbout} />
		<IntroModal show={AppState.showIntro} onClose={AppState.toggleIntro} />
		<ResumeModal show={AppState.showCV} onClose={AppState.toggleCV} />
		</div>
	)
}

export default App
