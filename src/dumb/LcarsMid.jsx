import React from "react"
import { Outlet } from "react-router-dom"

export const LcarsMid = (props) => {
	const { children } = props
	return (
		<div
			className='wrap lcars-body-container'
			id='gap'
		>
			<div className='left-frame'>
				<div>
					<div className='panel-3'>
						03<span className='hop'>-111968</span>
					</div>
					<div className='panel-4'>
						04<span className='hop'>-041969</span>
					</div>
					<div className='panel-5'>
						05<span className='hop'>-1701D</span>
					</div>
					<div className='panel-6'>
						06<span className='hop'>-071984</span>
					</div>
				</div>
			</div>
			<div className='right-frame'>
				<div className='bar-panel'>
					<div className='bar-6'></div>
					<div className='bar-9'></div>
					<div className='bar-8'></div>
					<div className='bar-7'></div>
				</div>
				{/* <div className='corner-bg'> */}
					{/* TODO: fix the fucking interior rounded corners */}
					{/* <div className='corner'></div> */}
				{/* </div> */}
				<div className='content'>
					<>{children.map((child) => child)}</>
					
					<div className='lcars-text-bar the-end'>
						<span>EOL</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LcarsMid
