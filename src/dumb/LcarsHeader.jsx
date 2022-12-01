import React from "react"

export const LcarsHeader = (props) => {
	return (
		<div className='wrap lcars-header-container'>
			{/* <svg width="0" height="0" viewBox="0 0 400 300"> */}
			{/* <defs>
    <mask id="mask">
      <rect fill="#000000" x="0" y="0" width="400" height="300"></rect>
      <circle fill="#FFFFFF" cx="150" cy="150" r="100" />
      <circle fill="#FFFFFF" cx="50" cy="50" r="150" />
    </mask>
  </defs>
</svg> */}
			<div className='scroll-top'>
				<a
					id='scroll-top'
					href=''
				>
					<span className='hop'>screen</span> top
				</a>
			</div>
			<div className='left-frame-top'>
				<div className='panel-2'>
					01<span className='hop'>-NAV</span>
				</div>
			</div>
			<div id="icars-top" className='right-frame-top'>
				{/* <div className='banner'>LCARS &#149; Online</div> */}

				<div className='data-cascade-button-group'>
					<div className='button-col'>
						<div
							className='button'
							id='top-left'
						>
							<a href=''>about</a>
						</div>
					</div>
					<div className='button-col'>
						<div
							className='button'
							id='top-right'
						>
							<a href=''>cv</a>
						</div>
					</div>

					<div className='cascade-wrapper'>
						<div className='data-cascade'>
							<div className='row-1'>
								<div className='dc1'>101</div>
								<div className='dc2'>7109</div>
								<div className='dc3'>1966</div>
								<div className='dc4'>1222</div>
								<div className='dc5'>2020</div>
							</div>
							<div className='row-2'>
								<div className='dc1'>102</div>
								<div className='dc2'>8102</div>
								<div className='dc3'>1987</div>
								<div className='dc4'>044</div>
								<div className='dc5'>0051</div>
							</div>
							<div className='row-3'>
								<div className='dc1'>103</div>
								<div className='dc2'>714</div>
								<div className='dc3'>1993</div>
								<div className='dc4'>0222</div>
								<div className='dc5'>052</div>
							</div>
						</div>
					</div>
				</div>
				{/* <div className='top-corner-bg'> */}
					{/* TODO: fix the fucking interior rounded corners */}
					{/* <div className='top-corner'></div> */}
				{/* </div> */}
				<div className='bar-panel'>
					<div className='bar-1'></div>
					{/* <div className='bar-2'></div> */}
					<div className='bar-3'></div>
					<div className='bar-4'></div>
					{/* <div className='bar-5'></div> */}
				</div>
			</div>
		</div>
	)
}

export default LcarsHeader
