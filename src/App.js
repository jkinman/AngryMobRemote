import React, { useEffect, useContext } from "react"
import "./style/App.scss"
// import AngryMob from "./pages/AngryMob"
import Render3d from "./dumb/Render3d"
import MainLayout from "./pages/MainLayout"
import ControllerLayout from "./pages/ControllerLayout"
// contexts
import { DeviceMetricsContext } from "./contexts/DeviceMetricsContext"
import UplinkComponent from "./smart/UplinkComponent"
import DeviceMetrics from "./smart/DeviceMetrics"
import { RTCContext } from "./contexts/RTCContext"
import { AppContext } from "./contexts/AppContext"

import {
	Routes,
	Route,
	useParams,
	BrowserRouter,
	useLocation,
	useSearchParams,
} from "react-router-dom"
import ConnectionStatus from "./dumb/ConnectionStatus"

function App() {
	const [searchParams] = useSearchParams()
	const RTCState = useContext(RTCContext)
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
			{/* This is the remote display */}
			{AppState.isRemote && (
				<ControllerLayout showQR={false} RTCId={AppState.RTCId} leftTop={<ConnectionStatus {...RTCState}/>}>
					<DeviceMetrics />
					<UplinkComponent />
				</ControllerLayout>
			)}

			{/* This is the 3D client scene */}
			{AppState.isClient && (
				<>
					<MainLayout
						leftMid={<ConnectionStatus {...RTCState}/>}
						connected={RTCState.peerConnection}
						aboutHandler={() => {
							AppContext.toggleAbout()
						}}
					>
						{/* <h2>Joel Kinman</h2> */}
						{/* <div className='infobox'>
					<p>Connect a mobile device by scanning the uplink access point.</p>
					<p>This creates a peer to peer communication socket via WebRTC.</p>
				</div> */}
					</MainLayout>
					<Render3d
						storeDataCallback={RTCState.storeDataCallback}
						showControls={AppState.show3DControls}
						dimScene={AppState.showAbout}
					/>
				</>
			)}
			{/* <DeviceMetrics /> */}
		</div>
	)
}

export default App
