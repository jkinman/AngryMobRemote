import React, { useEffect, useContext } from "react"
import "./App.css"
import AngryMob from "./pages/AngryMob"
// contexts
import { DeviceMetricsContext } from "./contexts/DeviceMetricsContext"
import UplinkComponent from "./smart/UplinkComponent"
import DeviceMetrics from "./smart/DeviceMetrics"
import { RTCContext } from "./contexts/RTCContext"

import { Routes, Route, useParams, BrowserRouter } from "react-router-dom"

function App() {
	let { id } = useParams()
	console.log(id)
	const RTCState = useContext(RTCContext)

	return (
		<div>
			<UplinkComponent id={id} />
			<Routes>
				<Route
					path='/peer/:id'
					element={
						<>
							<p>peer route</p>
							<DeviceMetrics />
						</>
					}
				/>
				<Route
					path='/'
					element={<AngryMob deviceMotionData={RTCState.data} />}
				/>
			</Routes>
		</div>
	)
}

export default App
