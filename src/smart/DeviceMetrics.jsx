import React, { useEffect, useContext } from "react";

import { DeviceMetricsContext } from "../contexts/DeviceMetricsContext";
import AccelerometerDisplay from "../dumb/AccelerometerDisplay";

let connection;

const UplinkComponent = (props) => {
  const deviceState = useContext(DeviceMetricsContext);

  useEffect(() => {}, []);

  return (
    <div>
      {deviceState.deviceMotionAvailable ? (
        <div>
          {!deviceState.permissionGranted ? (
            <button onClick={deviceState.enableDeviceOrientationCallback}>
              enable device metrics
            </button>
          ) : null}
          <AccelerometerDisplay
            deviceMotion={deviceState.deviceMotion}
            deviceOrientation={deviceState.deviceOrientation}
            permissionStatus={deviceState.permissionStatus}
          />
        </div>
      ) : (
        <p>no accelerometer</p>
      )}
    </div>
  );
};

export default UplinkComponent;
