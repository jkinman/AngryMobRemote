import React, { useEffect, useState } from "react"
import "./UplinkComponent.scss"
import theme from "../style/_vars.scss"
import QRCode from "qrcode"

import { useRTC, useApp } from "../hooks"
import CyberLoadingAnim from "../dumb/CyberLoadingAnim"

const UplinkComponent = (props) => {
	const { deviceState } = props
	const [qrUrl, setQrUrl] = useState()
	const requestRef = React.useRef()
	const RTCState = useRTC()
	const AppState = useApp()
	const sendDeviceDetails = (RTCState, deviceState) => {
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
					light: "#25f",
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
						rel='noreferrer'
						href={`${window.location.origin}?id=${RTCState.peerId}`}
					>
						<img
							srcSet={qrUrl}
							alt='QR Code for device connection'
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
