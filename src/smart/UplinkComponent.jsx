import React, { useEffect, useContext, useState } from "react"

import QRCode from "qrcode"
import { useLocation } from "react-router-dom"

import { DeviceMetricsContext } from "../contexts/DeviceMetricsContext"
import { RTCContext } from "../contexts/RTCContext"
import ConnectionStatus from "../dumb/ConnectionStatus"

let generatedQRDataURL

const UplinkComponent = (props) => {
	const [qrUrl, setQrUrl] = useState()
	const { id } = props
	const RTCState = useContext(RTCContext)
	const deviceState = useContext(DeviceMetricsContext)

	useEffect(() => {
		RTCState.connectToPeer(id)
		const qrLink = `${window.location.origin}/peer/${RTCState.peer.id}`

		QRCode.toDataURL(
			qrLink,
			{
				errorCorrectionLevel: "L",
				version: 4,
				type: "image/jpeg",
				quality: 0.5,
				margin: 0,
				color: {
					dark: "#000000",
					light: "#FFF",
				},
			},
			(err, url) => {
				if (err) console.error(err)
				else {
					setQrUrl(url)
				}
			}
		)
	}, [RTCState.peer])

	return (
		<div>
			<ConnectionStatus connection={RTCState.connection} />
			<img srcSet={qrUrl} />
		</div>
	)
}

export default UplinkComponent
