import React, { useEffect, useContext } from "react"
import "./style/App.scss"
// import AngryMob from "./pages/AngryMob"
import Render3d from "./dumb/Render3d"
import MainLayout from "./pages/MainLayout"
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

function App() {
	const [searchParams] = useSearchParams()
	const RTCState = useContext(RTCContext)
	const AppState = useContext(AppContext)
	useEffect(() => {
		AppState.setPeerId(searchParams.get("id"))
	}, [])

	return (
		<div>
			{AppState.isRemote && (
				<>
					<UplinkComponent />
					<DeviceMetrics />
				</>
			)}

			<MainLayout connected={RTCState.peerConnection}>
				<UplinkComponent />
				{/* <h2>Joel Kinman</h2> */}
				<div className='infobox'>
					<p>Connect a mobile device by scanning the uplink access point.</p>
					<p>This creates a peer to peer communication socket via WebRTC.</p>
				</div>
			</MainLayout>
			<DeviceMetrics />
			<Render3d storeDataCallback={RTCState.storeDataCallback} />
		</div>
	)
}

export default App
