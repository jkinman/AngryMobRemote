import React from "react"
import Stats from "stats.js"

let stats, alphaPanel, betaPanel, gammaPanel
stats = new Stats()
alphaPanel = stats.addPanel(new Stats.Panel("alpha", "#ff8", "#221"))
betaPanel = stats.addPanel(new Stats.Panel("beta", "#f8f", "#212"))
gammaPanel = stats.addPanel(new Stats.Panel("gamma", "#f8f", "#212"))

export const RealtimeLineGraph = (props) => {
	const { deviceOrientation } = props
    const requestRef = React.useRef()

	React.useEffect(() => {
		// stats.showPanel(3)
		// stats.showPanel(4)
		document.body.appendChild(stats.dom)
		// animate()
	}, [deviceOrientation])

    stats.begin()
    stats.end()
    alphaPanel.update(deviceOrientation.alpha, 460)
    betaPanel.update(deviceOrientation.beta, 460)
    gammaPanel.update(deviceOrientation.gamma, 460)

	const animate = () => {
		let time = performance.now() / 1000
		// context.clearRect(0, 0, 512, 512)

		stats.begin()
		stats.end()
		alphaPanel.update(deviceOrientation.alpha, 460)
		betaPanel.update(deviceOrientation.beta, 460)
		gammaPanel.update(deviceOrientation.gamma, 460)

		requestRef.current = requestAnimationFrame(animate)
	}

	// const data = {
	// 	date: deviceOrientation.timeStamp,
	// 	Alpha: deviceOrientation.alpha,
	// 	Beta: deviceOrientation.beta,
	// 	Gamma: deviceOrientation.gamma,
	// }

	return (
        <></>
	)
}

export default RealtimeLineGraph
