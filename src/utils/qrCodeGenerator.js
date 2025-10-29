import QRCode from "qrcode"

/**
 * Generate a QR code data URL for a peer connection
 * @param {string} peerId - The peer ID to encode in the QR code
 * @param {Object} theme - Theme object with color values
 * @returns {Promise<string>} Promise that resolves to a data URL
 */
export const generateQRCode = (peerId, theme) => {
	if (!peerId) {
		return Promise.reject(new Error("Peer ID is required"))
	}

	const qrLink = `${window.location.origin}?id=${peerId}`
	
	return new Promise((resolve, reject) => {
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
				if (err) {
					console.error("QR code generation error:", err)
					reject(err)
				} else {
					resolve(url)
				}
			}
		)
	})
}

export default generateQRCode

