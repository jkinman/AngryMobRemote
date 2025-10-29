import React from "react"
import CyberpunkModal from "../../dumb/CyberPunkModal"
import ComputerAndMobile from '../../img/laptop+mobile.png'

/**
 * IntroModal - Displays welcome/intro information
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the modal
 * @param {Function} props.onClose - Callback when modal is closed
 */
const IntroModal = ({ show, onClose }) => {
	return (
		<CyberpunkModal show={show} close={onClose}>
			<>
				<h1>Welcome</h1>
				<p>
					Turn your phone into a wireless gyroscopic controller for this 3D scene. 
					Your device's orientation data is streamed over a peer-to-peer WebRTC connection 
					and converted to quaternion-based camera rotation.
				</p>
				<div style={{ textAlign: 'center', margin: '1em 0' }}>
					<img src={ComputerAndMobile} alt="Computer and mobile device" width="160px"/>
				</div>

				<h2>How to Use</h2>
				<p>
					<strong>Desktop:</strong> Click and drag to orbit, scroll to zoom.
				</p>
				<p>
					<strong>Mobile:</strong> Scan the QR code to connect, enable device sensors, 
					and control the camera with your phone's gyroscope.
				</p>
			</>
		</CyberpunkModal>
	)
}

export default IntroModal

