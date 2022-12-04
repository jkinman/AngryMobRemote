import React from "react"
import "./MainLayout.scss"
import { Outlet } from "react-router-dom"
import jkLogo from "../img/jk-cyberpunk.png"
import LcarsHeader from "../dumb/LcarsHeader"
import LcarsMid from "../dumb/LcarsMid"

export const MainLayout = (props) => {
	const {children, RTCId} = props
	return (
		<div className="controller-app-layout">
			<LcarsHeader aboutHandler={props.aboutHandler} cvHandler={props.cvHandler} />
			<LcarsMid children={props.children} />
		</div>
	)
}

export default MainLayout
