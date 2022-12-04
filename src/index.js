import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { Peer } from "peerjs"

// Router
import {
	createBrowserRouter,
	RouterProvider,
	BrowserRouter,
} from "react-router-dom"

// contexts
import DeviceMetricsProvider from "./contexts/DeviceMetricsContext"
import RTCProvider from "./contexts/RTCContext"
import AppProvider, { AppContext } from "./contexts/AppContext"

const peerConnection = new Peer()
// App Routes

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
	// <React.StrictMode>
	<BrowserRouter>
		<AppProvider>
			<AppContext.Consumer>
				{(AppState) => (
					<RTCProvider
						value={{
							peer: peerConnection,
							stateTransferHandler: AppState.stateTransfer,
						}}
					>
						<DeviceMetricsProvider>
							<App />
						</DeviceMetricsProvider>
					</RTCProvider>
				)}
			</AppContext.Consumer>
		</AppProvider>
	</BrowserRouter>
	// </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
