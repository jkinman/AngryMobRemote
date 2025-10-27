import React, { useEffect, useContext } from 'react'

const AccelerometerDisplay = (props) => {

    const {deviceMotion, deviceOrientation, permissionStatus} = props

    return(
        <div>
            <h1>Permission</h1>
            <p>{JSON.stringify(permissionStatus)}</p>
            <h1>motion</h1> 
            <p>x:{deviceMotion.x}</p>
            <p>y:{deviceMotion.y}</p>
            <p>z:{deviceMotion.z}</p>
            <h1>orientation</h1> 
            <p>alpha:{deviceOrientation.alpha}</p>
            <p>beta :{deviceOrientation.beta}</p>
            <p>gamma:{deviceOrientation.gamma}</p>

        </div>
    )
}

export default AccelerometerDisplay