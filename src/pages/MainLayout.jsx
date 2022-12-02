import React from "react"
import "./MainLayout.scss"
import { Outlet } from "react-router-dom"
import jkLogo from "../img/jk-cyberpunk.png"
import LcarsHeader from "../dumb/LcarsHeader"
import LcarsMid from "../dumb/LcarsMid"

export const MainLayout = (props) => {
	const {children, leftMid} = props
	return (
		<div className="main-app-layout">
			<LcarsHeader />
			<LcarsMid children={props.children} leftMid={leftMid}/>
		</div>
	)
}

export default MainLayout
