import React from "react"
import { Outlet } from "react-router-dom"
import UplinkComponent from "../smart/UplinkComponent"

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
					<UplinkComponent />
						02<span className="hop">- UPLINK ACCESS POINT</span>
					</div>
					<div className='panel-4'>
					03<span className='hop'>-111968</span>
					</div>
					<div className='panel-5'>
						04<span className='hop'>-1701D</span>
					</div>
					<div className='panel-6'>
						05<span className='hop'>-071984</span>
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
					<>{Array.isArray(children) && children.map((child) => child)}</>
					{/*  TODO carve this into a component*/}
					{/* <div className='lcars-text-bar the-end'>
						<span>EOL</span>
					</div> */}
				</div>
			</div>
		</div>
	)
}

export default LcarsMid
