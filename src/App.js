import React, { useEffect, useContext } from "react"
import "./App.css"
// import AngryMob from "./pages/AngryMob"
import Render3d from './dumb/Render3d'
import MainLayout from "./pages/MainLayout"
// contexts
import { DeviceMetricsContext } from "./contexts/DeviceMetricsContext"
import UplinkComponent from "./smart/UplinkComponent"
import DeviceMetrics from "./smart/DeviceMetrics"
import { RTCContext } from "./contexts/RTCContext"

import { Routes, Route, useParams, BrowserRouter } from "react-router-dom"

function App() {
	let { id } = useParams()
	const RTCState = useContext(RTCContext)

	return (
		<div>
			<BrowserRouter>
				<Routes>
					<Route element={<MainLayout />}>
						<Route
							path='/test'
							element={
								<>
									<h1>TEST ROUTE</h1>
								</>
							}
						/>
						<Route
							path='/peer/:id'
							element={
								<>
									<p>peer route</p>
									<DeviceMetrics />
									<UplinkComponent />
								</>
							}
						/>
						<Route
							path='/'
							element={
								<>
									<UplinkComponent />
									<DeviceMetrics />
									<Render3d storeDataCallback={RTCState.storeDataCallback} />
									{/* <AngryMob deviceMotionData={RTCState.data} /> */}
								</>
							}
						/>
					</Route>
				</Routes>
			</BrowserRouter>
		</div>
	)
}

export default App
