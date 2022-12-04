import React, { useEffect, useContext, useState } from "react"
import "./UplinkComponent.scss"
import theme from "../style/_vars.scss"
import QRCode from "qrcode"

import { RTCContext } from "../contexts/RTCContext"
import { AppContext } from "../contexts/AppContext"

import CyberLoadingAnim from "../dumb/CyberLoadingAnim"

const UplinkComponent = (props) => {
	const { deviceState } = props
	const [qrUrl, setQrUrl] = useState()
	const requestRef = React.useRef()
	const RTCState = useContext(RTCContext)
	// const deviceState = useContext(DeviceMetricsContext)
	const AppState = useContext(AppContext)
	const sendDeviceDetails = (RTCState, deviceState) => {
		// console.log(deviceState)
		if (deviceState) {
			RTCState.sendData({
				data: {
					...deviceState.deviceMotion,
					...deviceState.deviceOrientation,
				},
			})
		}
		requestRef.current = requestAnimationFrame(sendDeviceDetails)
	}

	useEffect(() => {
		RTCState.sendData({
			state: { showAbout: AppState.showAbout, showCV: AppState.showCV },
		})
	}, [AppState.showAbout, AppState.showCV])

	useEffect(() => {
		if (deviceState && deviceState.isMobile) {
			requestRef.current = requestAnimationFrame(() =>
				sendDeviceDetails(RTCState, deviceState)
			)
		}
		return () => cancelAnimationFrame(requestRef.current)
	}, [deviceState, RTCState])

	useEffect(() => {
		if (AppState.RTCId && RTCState.peerId)
			RTCState.connectToPeer(AppState.RTCId)
	}, [AppState.RTCId, RTCState.peerId])

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
					dark: "#f83",
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
			{!AppState.RTCId && !RTCState.peerConnection && (
				<div className='qrCodeLink'>
					<a
						target='_blank'
						href={`${window.location.origin}?id=${RTCState.peerId}`}
					>
						<img
							srcSet={qrUrl}
							className='qr-uplink'
						/>
					</a>
				</div>
			)}
			{RTCState.peerConnection && <CyberLoadingAnim />}
		</div>
	)
}

export default UplinkComponent
