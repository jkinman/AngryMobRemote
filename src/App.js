import React, { useEffect, useContext } from 'react'
import './App.css';
import AngryMob from './pages/AngryMob'
// contexts
import { DeviceMetricsContext } from './contexts/DeviceMetricsContext';
import UplinkComponent from './smart/UplinkComponent';
import DeviceMetrics from './smart/DeviceMetrics';
import { RTCContext } from "./contexts/RTCContext"

import { Routes, Route, useParams } from 'react-router-dom';

function App() {
  let {peerId} = useParams();
	const RTCState = useContext(RTCContext)

  return (
    <div>
      <UplinkComponent id={peerId}/>
      <DeviceMetrics />
      <AngryMob deviceMotionData={RTCState.data}/>
    </div>
  );
}

export default App;
