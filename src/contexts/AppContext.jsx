import React, { useState, useReducer, useEffect } from "react";

const initialState = {
  rotationRate: [0, 0, 0, 0],
  peerConnection: false,
  peerID: false,
  connectionID: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "initializeState":
      return initialState;

    case "device/setRotationRate":
      return {
        ...state,
        rotationRate: [
          action.payload.DeviceRotationRate.alpha,
          action.payload.DeviceRotationRate.beta,
          action.payload.DeviceRotationRate.gamma,
        ],
      };

    case "connection/setPeer":
    return{
        ...state,
        peerConnection: action.payload
    };

    case "connection/setPeerID":
        return{
            ...state,
            peerID: action.payload
        };
        
    case "connection/setID":
        return{
            ...state,
            connectionID: action.payload
        };
    
    default:
      return state;
  }
};

const AppContext = React.createContext();

const AppProvider = (props) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  useEffect(() => {}, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export { AppContext };
export const AppConsumer = AppContext.Consumer;
export default AppProvider;
