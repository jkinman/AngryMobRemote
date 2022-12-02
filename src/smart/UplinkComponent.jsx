import React, { useEffect, useContext, useState } from "react"
import "./UplinkComponent.scss"
import theme from "../style/_vars.scss"
import QRCode from "qrcode"
import RealtimelineGraph from "../dumb/RealtimeLineGraph"

import { DeviceMetricsContext } from "../contexts/DeviceMetricsContext"
import { RTCContext } from "../contexts/RTCContext"
import { AppContext } from "../contexts/AppContext"
import ConnectionStatus from "../dumb/ConnectionStatus"
import { useParams } from "react-router-dom"

const UplinkComponent = (props) => {
	const [qrUrl, setQrUrl] = useState()
	const requestRef = React.useRef()
	const RTCState = useContext(RTCContext)
	const deviceState = useContext(DeviceMetricsContext)
	const AppState = useContext(AppContext)
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
		}
		return () => cancelAnimationFrame(requestRef.current)
	}, [deviceState.isMobile, deviceState, RTCState])

	useEffect(() => {
		if (AppContext.peerId && RTCState.peerId) RTCState.connectToPeer(AppContext.peerId)
	}, [AppContext.peerId, RTCState.peerId])

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
					light: theme.themeColour1,
					light: "#25f",
					dark: '#f83',
					dark: theme.themeColour1,
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

		<div className='uplink'>
			{!AppContext.peerId && !RTCState.peerConnection && (
					<div className='qrCodeLink'>
					<img
						srcSet={qrUrl}
						className='qr-uplink'
					/>
					</div>
			)}
			</div>

	)
}

export default UplinkComponent
