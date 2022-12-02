import React from "react"
import SceneBase from "../modules/3d/SceneBase.js"

let threedScene

export const Render3d = (props) => {
    const {storeDataCallback, showControls, dimScene} = props
	React.useEffect(()=>{
        threedScene = new SceneBase({showControls})
        storeDataCallback((data)=>threedScene.updateData(data))
}, [])
React.useEffect(()=>{
    threedScene.dimScene(dimScene)
})
}

export default Render3d