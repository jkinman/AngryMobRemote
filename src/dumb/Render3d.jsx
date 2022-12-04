import React from "react"
import SceneBase from "../modules/3d/SceneBase.js"

let threedScene
export const Render3d = (props) => {
	const { RTCState, storeDataCallback, showControls, isClient } = props

	React.useEffect(() => {
		threedScene = new SceneBase({showControls})
		// threedScene.setShowControls(showControls)
		storeDataCallback( (data)=>threedScene.updateData(data))
	}, [])

	React.useEffect(() => {
		if(isClient){
			threedScene.startUp({showControls})
			storeDataCallback( (data)=>threedScene.updateData(data))
		}
	}, [isClient])
	React.useEffect(() => {
		if(isClient){
			threedScene.setShowControls(showControls)
		}
	}, [showControls])
}

export default Render3d
