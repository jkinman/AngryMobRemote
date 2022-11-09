import React, { useEffect, useContext } from 'react'

const AccelerometerDisplay = (props) => {

    const {accelerometer, deviceOrientation, motion, motionx, scrollY} = props

    return(
        <div>
            <h1>Orientation: {JSON.stringify(deviceOrientation)}</h1>
            <h1>Accelerometer</h1> 

            <h4>{JSON.stringify(accelerometer)}</h4>
            <h4>{JSON.stringify(motion)}</h4>
            <h5>scrollY: {scrollY}</h5>
            <h5>motion x: {motionx}</h5>
        </div>
    )
}

export default AccelerometerDisplay