import React, { useEffect, useContext } from "react";

import { DeviceMetricsContext } from "../contexts/DeviceMetricsContext";
import AccelerometerDisplay from "../dumb/AccelerometerDisplay";

let connection;

const UplinkComponent = (props) => {
  const deviceState = useContext(DeviceMetricsContext);

  useEffect(() => {}, []);

  return (
    <div>
      <AccelerometerDisplay
        accelerometer={deviceState.rotationRate}
        deviceOrientation={deviceState.deviceOrientation}
        motion={deviceState.deviceMotion}
        scrollY={deviceState.scrollY}
        motionx={deviceState.alpha}
      />
    </div>
  );
};

export default UplinkComponent;
