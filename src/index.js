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

const peerConnection = new Peer()
// App Routes
const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
	},
	{
		path: "/peer/:id",
		element: <App />,
	},
])

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
	<React.StrictMode>
		<DeviceMetricsProvider>
			<RTCProvider peer={peerConnection}>
				<App />
				{/* <RouterProvider
					router={router}
				/> */}
       
			</RTCProvider>
		</DeviceMetricsProvider>
	</React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
