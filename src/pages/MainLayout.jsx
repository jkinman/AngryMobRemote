import React from "react"
import "./MainLayout.scss"
import { Outlet } from "react-router-dom"
import jkLogo from "../img/jk-cyberpunk.png"
import LcarsHeader from '../dumb/LcarsHeader'
import LcarsMid from '../dumb/LcarsMid'

export const MainLayout = (props) => {
	// const imgClass =
	return (
		<div>
			<LcarsHeader />
<LcarsMid />
			<div className='mainBanner'>
				<div className='logo'>
					<img
						src={jkLogo}
						className={!props.connected ? "normal" : "shrink"}
					/>
					<h2 style={{ textAlign: "center" }}>Web RTC device link</h2>
				</div>
				<Outlet />
			</div>
		</div>
	)
}

export default MainLayout
