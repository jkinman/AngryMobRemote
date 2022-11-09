import React, { useEffect, useContext } from "react";

import { DeviceMetricsContext } from "../contexts/DeviceMetricsContext";
import AccelerometerDisplay from "../dumb/AccelerometerDisplay";

let connection;

const UplinkComponent = (props) => {
  const deviceState = useContext(DeviceMetricsContext);

  useEffect(() => {}, []);

  return (
    <div>
      <button onClick={deviceState.enableDeviceOrientationCallback}>enable device metrics</button>
      <AccelerometerDisplay
        deviceMotion={deviceState.deviceMotion}
        deviceOrientation={deviceState.deviceOrientation}
        permissionStatus={deviceState.permissionStatus}
      />
    </div>
  );
};

export default UplinkComponent;
