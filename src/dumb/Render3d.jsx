import React from "react"
import SceneBase from "../modules/3d/SceneBase.js"

let threedScene

export const Render3d = (props) => {
	const { RTCState, storeDataCallback, showControls, isClient } = props

	React.useEffect(() => {
		threedScene = new SceneBase({ showControls })
	}, [])

	React.useEffect(() => {
		if(isClient){
			storeDataCallback((data) => threedScene.updateData(data))
			threedScene.startUp()
		}
	}, [isClient])
}

export default Render3d
