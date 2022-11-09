import React, { useState, useReducer, useEffect } from "react";

const initialState = {
  rotationRate: { x: 0, y: 0, z: 0 },
  peerConnection: false,
  peerID: false,
  connectionID: false,
  deviceOrientation: 0,
  deviceMotion: { x: 0, y: 0, z: 0 },
  scrollY: window.scrollY,
  alpha: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "initializeState":
      return initialState;

    case "device/setRotationRate":
      return {
        ...state,
        alpha: action.payload.alpha,
        rotationRate: {
          z: action.payload.alpha, //z
          x: action.payload.beta, //x
          y: action.payload.gamma, //y
        },
      };

    case "device/setDeviceMotion":
      return {
        ...state,
        deviceMotion: {
          x: action.payload.acceleration.x,
          y: action.payload.acceleration.y,
          z: action.payload.acceleration.z,
        },
      };

    case "device/setDeviceOrientation":
      return {
        ...state,
        deviceOrientation: action.payload,
      };

    case "device/setScroll":
      return {
        ...state,
        scrollY: action.payload,
      };

    case "connection/setPeer":
      return {
        ...state,
        peerConnection: action.payload,
      };

    case "connection/setPeerID":
      return {
        ...state,
        peerID: action.payload,
      };

    case "connection/setID":
      return {
        ...state,
        connectionID: action.payload,
      };

    default:
      return state;
  }
};

const DeviceMetricsContext = React.createContext();

const DeviceMetricsProvider = (props) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  useEffect(() => {
    console.log("DeviceMotionEvent", DeviceMotionEvent);
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      // Handle iOS 13+ devices.
      DeviceMotionEvent.requestPermission()
        .then((state) => {
          if (state === "granted") {
            linkHandlers();
          } else {
            console.error("Request to access the orientation was rejected");
          }
        })
        .catch(console.error);
    } else {
      // Handle regular non iOS 13+ devices.
      linkHandlers();
    }
    window.addEventListener("scroll", handleScrollCallback, true);
    console.log("setup device events.", window);
  }, []);

  const linkHandlers = () => {
    window.addEventListener("orientationchange", handleOrientationChange, true);
    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    window.addEventListener("devicemotion", handleDeviceMotion, true);
  };

  const handleDeviceOrientation = (event) => {
    console.log("handleDeviceOrientation: ", event);
    dispatch({ type: "device/setDeviceOrientation", payload: event });
  };

  const handleDeviceMotion = (event) => {
    console.log("handleDeviceMotion: ", event);
    dispatch({ type: "device/setDeviceMotion", payload: event });
  };

  const handleScrollCallback = (event) => {
    dispatch({
      type: "device/setScroll",
      payload: window.scrollY,
    });
  };

  const handleOrientationChange = (event) => {
    console.log("handleOrientationChange: ", event);
    dispatch({
      type: "device/orientationChange",
      payload: event.currentTarget.orientation,
    });
  };

  return (
    <DeviceMetricsContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {props.children}
    </DeviceMetricsContext.Provider>
  );
};

export { DeviceMetricsContext };
export const DeviceMetricsConsumer = DeviceMetricsContext.Consumer;
export default DeviceMetricsProvider;
