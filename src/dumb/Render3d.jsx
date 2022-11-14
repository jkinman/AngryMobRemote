import React from "react"
import SceneBase from "../modules/3d/SceneBase.js"

let threedScene

export const Render3d = (props) => {
    const {storeDataCallback} = props

	React.useEffect(()=>{
        console.log(SceneBase)
        threedScene = new SceneBase()
        storeDataCallback((data)=>threedScene.updateData(data))
}, [])
}

export default Render3d