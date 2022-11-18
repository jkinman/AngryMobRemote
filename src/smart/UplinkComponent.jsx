import React, { useEffect, useContext, useState } from "react"
import "./UplinkComponent.scss"
import theme from "../style/_vars.scss"
import QRCode from "qrcode"
import RealtimelineGraph from "../dumb/RealtimeLineGraph"

import { DeviceMetricsContext } from "../contexts/DeviceMetricsContext"
import { RTCContext } from "../contexts/RTCContext"
import ConnectionStatus from "../dumb/ConnectionStatus"
import { useParams } from "react-router-dom"

const UplinkComponent = (props) => {
	const [qrUrl, setQrUrl] = useState()
	let { id } = useParams()
	const requestRef = React.useRef()
	const RTCState = useContext(RTCContext)
	const deviceState = useContext(DeviceMetricsContext)

	const sendDeviceDetails = (RTCState, deviceState) => {
		RTCState.sendData({
			...deviceState.deviceMotion,
			...deviceState.deviceOrientation,
		})
		requestRef.current = requestAnimationFrame(sendDeviceDetails)
	}

	useEffect(() => {
		if (deviceState.isMobile) {
			requestRef.current = requestAnimationFrame(() =>
				sendDeviceDetails(RTCState, deviceState)
			)
			// setInterval( ()=>sendDeviceDetails(RTCState, deviceState), 1000 / 10)
			// setInterval( ()=>sendDeviceDetails(RTCState.sendData), 1000 / 24)
			// requestRef.current = requestAnimationFrame( ()=>{

			// } )
		}
		return () => cancelAnimationFrame(requestRef.current)
	}, [deviceState.isMobile, deviceState, RTCState])

	useEffect(() => {
		if (id && RTCState.peerId) RTCState.connectToPeer(id)
	}, [id, RTCState.peerId])

	useEffect(() => {
		if (!RTCState.peerId) return
		const qrLink = `${window.location.origin}/peer/${RTCState.peerId}`
		QRCode.toDataURL(
			qrLink,
			{
				errorCorrectionLevel: "L",
				version: 5,
				type: "image/jpeg",
				quality: 0.5,
				margin: 1,
				color: {
					dark: theme.themeColour1,
					light: theme.themeColour3,
				},
			},
			(err, url) => {
				if (err) console.error(err)
				else {
					setQrUrl(url)
				}
			}
		)
	}, [RTCState.peerId])

	return (
		<div>
			{/* <ConnectionStatus
				// data={RTCState.data}
				sendData={RTCState.sendData}
				status={RTCState.status}
				peerOpen={RTCState.peer.open}
				peer={RTCState.peer}
				connection={RTCState.connection}
				connectionID={RTCState.connectionId}
				dataConnections={[...RTCState.dataConnections].map(
					([key, value]) => value
				)}
			/> */}
			{/* <RealtimelineGraph deviceOrientation={RTCState.data} /> */}

			{!id && !RTCState.peerConnection && (
				<div className='wrapper'>
					<h5>uplink access point</h5>
					<div className='qrCodeLink'>
						<div className='box-container-3d'>
							<div>
								<img
									width='100px'
									srcSet={qrUrl}
									className='qr-uplink'
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default UplinkComponent
