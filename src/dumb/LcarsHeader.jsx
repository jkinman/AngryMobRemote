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
				{/* <div className='panel-1'>
					<a href=''>LCARS</a>
				</div> */}
				<div className='panel-2'>
					02<span className='hop'>-262000</span>
				</div>
			</div>
			<div className='right-frame-top'>
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
								<div className='dc6'>1444</div>
								<div className='dc7'>102</div>
								<div className='dc8'>1103</div>
								<div className='dc9'>1935</div>
								{/* <div className='dc10'>1940</div>
								<div className='dc11'>708</div>
								<div className='dc12'>M113</div>
								<div className='dc13'>1956</div>
								<div className='dc14'>1209</div> */}
							</div>
							<div className='row-2'>
								<div className='dc1'>102</div>
								<div className='dc2'>8102</div>
								<div className='dc3'>1987</div>
								<div className='dc4'>044</div>
								<div className='dc5'>0051</div>
								<div className='dc6'>607</div>
								<div className='dc7'>1976</div>
								<div className='dc8'>1031</div>
								<div className='dc9'>1984</div>
								{/* <div className='dc10'>1954</div>
								<div className='dc11'>1103</div>
								<div className='dc12'>415</div>
								<div className='dc13'>1045</div>
								<div className='dc14'>1864</div> */}
							</div>
							<div className='row-3'>
								<div className='dc1'>103</div>
								<div className='dc2'>714</div>
								<div className='dc3'>1993</div>
								<div className='dc4'>0222</div>
								<div className='dc5'>052</div>
								<div className='dc6'>1968</div>
								<div className='dc7'>2450</div>
								<div className='dc8'>746</div>
								<div className='dc9'>56</div>
								{/* <div className='dc10'>47</div>
								<div className='dc11'>716</div>
								<div className='dc12'>8719</div>
								<div className='dc13'>417</div>
								<div className='dc14'>602</div> */}
							</div>
						</div>
					</div>
				</div>
				<div className='top-corner-bg'>
					<div className='top-corner'></div>
				</div>
				<div className='bar-panel'>
					<div className='bar-1'></div>
					<div className='bar-2'></div>
					<div className='bar-3'></div>
					<div className='bar-4'></div>
					<div className='bar-5'></div>
				</div>
			</div>
		</div>
	)
}

export default LcarsHeader
