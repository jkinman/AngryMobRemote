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
    const sendDeviceDetails = () => {
        RTCState.sendData( {...deviceState.deviceMotion, ...deviceState.deviceOrientation})
        if( deviceState.deviceMotionAvailable) requestAnimationFrame( sendDeviceDetails )
    }

    useEffect(()=>{
        if( deviceState.deviceMotionAvailable) sendDeviceDetails()
    }, [deviceState.deviceMotionAvailable])
	useEffect(() => {
		if (id && RTCState.peerId) RTCState.connectToPeer(id)
	}, [id, RTCState.peerId])

	useEffect(() => {
		if (!RTCState.peerId) return
		console.log(RTCState.peer)
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
	}, [RTCState.peerId])

	return (
		<div>
			<ConnectionStatus
				// data={RTCState.data}
				sendData={RTCState.sendData}
				status={RTCState.status}
				peerOpen={RTCState.peer.open}
				peer={RTCState.peer}
				connection={RTCState.connection}
				connectionID={RTCState.connectionID}
				dataConnections={[...RTCState.dataConnections].map(
					([key, value]) => value
				)}
			/>
			{!id && <img srcSet={qrUrl} />}
		</div>
	)
}

export default UplinkComponent
