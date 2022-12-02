import React from "react"
import './CyberLoadingAnim.scss'
import theme from '../style/_vars.scss'

export const CyberLoadingAnim = (props) => {

    const colour1 = "#000"//theme.themeColour2
    const colour2 = theme.themeColour1

	return (
		<div className='cyber-loading-anim'>
			<svg
				className='circleFW'
				viewBox='0 0 1000 1000'
			>
				<circle
					className='path'
					cx='500'
					cy='500'
					fill='none'
					r='355'
					stroke={colour1}
				/>
			</svg>
			<svg
				className='circleSW'
				style={{animationDuration: 1.4}}
				viewBox='0 0 1000 1000'
			>
				<circle
					className='path2'
					cx='500'
					cy='500'
					fill='none'
					r='355'
					stroke={colour2}
				/>
			</svg>
			<svg
				className='circleFW'
				viewBox='0 0 1000 1000'
			>
				<circle
					className='path3'
					cx='500'
					cy='500'
					fill='none'
					r='355'
					stroke={colour2}
				/>
			</svg>
			<svg
				className='circleFW'
				viewBox='0 0 1000 1000'
			>
				<circle
					className='path4'
					cx='500'
					cy='500'
					fill='none'
					r='255'
					stroke='#FFF'
				/>
			</svg>
			<svg
				className='circleFW'
				viewBox='0 0 1000 1000'
			>
				<circle
					className='path5'
					cx='500'
					cy='500'
					fill='none'
					r='420'
					stroke={colour2}
				/>
			</svg>
			<svg
				className='circleFW'
				viewBox='0 0 1000 1000'
			>
				<circle
					className='path6'
					cx='500'
					cy='500'
					fill='none'
					r='420'
					stroke={colour2}
				/>
			</svg>
			<svg
				className='circleSW'
				viewBox='0 0 1000 1000'
			>
				<circle
					className='path7'
					cx='500'
					cy='500'
					fill='none'
					r='420'
					stroke={colour2}
				/>
			</svg>
			<svg
				className='circleSW'
				style={{animationTimingFunction: 'ease-in-out'}}
				viewBox='0 0 1000 1000'
			>
				<circle
					className='path8'
					cx='500'
					cy='500'
					fill='none'
					r='420'
					stroke={colour2}
				/>
				<svg
					className='circleFW'
					viewBox='0 0 1000 1000'
				></svg>
				<circle
					className='path9'
					cx='500'
					cy='500'
					fill='none'
					r='225'
					stroke={colour2}
				/>
			</svg>{" "}
		</div>
	)
}

export default CyberLoadingAnim
