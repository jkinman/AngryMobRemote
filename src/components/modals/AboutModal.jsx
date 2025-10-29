import React from "react"
import CyberpunkModal from "../../dumb/CyberPunkModal"

/**
 * AboutModal - Displays information about the demo
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the modal
 * @param {Function} props.onClose - Callback when modal is closed
 */
const AboutModal = ({ show, onClose }) => {
	return (
		<CyberpunkModal show={show} close={onClose}>
			<>
				<h1>About This Demo</h1>

				<p>
					Turn your phone into a wireless gyroscopic controller for this 3D scene. 
					Your device's accelerometer streams orientation data over a peer-to-peer 
					WebRTC connection—no servers, no backend, just pure client-side JavaScript.
				</p>

				<h2>How It Works</h2>
				<p>
					Scan the QR code with your mobile device to establish a direct WebRTC connection. 
					Your phone's orientation (alpha, beta, gamma) is converted to quaternion-based 
					camera rotation at 60 FPS with sub-frame latency.
				</p>

				<h2>Tech Stack</h2>
				<ul>
					<li>Three.js for real-time WebGL rendering</li>
					<li>WebRTC DataChannel for P2P communication</li>
					<li>Device Orientation API for gyroscope data</li>
					<li>React + SASS for the UI</li>
				</ul>
			</>
		</CyberpunkModal>
	)
}

export default AboutModal

