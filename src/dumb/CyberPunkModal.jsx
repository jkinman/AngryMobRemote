import React from "react"
import "./CyberPunkModal.scss"

const CyberpunkModal = React.memo((props) => {
	const { show, children, close } = props

	if (!show) return null

	return (
		<div className='modal'>
			<div className='cyberpunk'>
				<div className='container cyberpunk2077'>
					<div className='content'>
						{children ? (
							children
						) : (
							<>
								<h1>modal header</h1>
								<p>modal body</p>
							</>
						)}
						<div className='close'>
							<button
								className='cyberpunk2077 green'
								onClick={() => close()}
							>
								close
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
})

CyberpunkModal.displayName = 'CyberpunkModal'

export default CyberpunkModal
