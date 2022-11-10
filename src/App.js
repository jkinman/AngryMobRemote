import React, { useEffect, useContext } from 'react'
import './App.css';

// contexts
import { DeviceMetricsContext } from './contexts/DeviceMetricsContext';
import UplinkComponent from './smart/UplinkComponent';
import DeviceMetrics from './smart/DeviceMetrics';

import { Routes, Route, useParams } from 'react-router-dom';

function App() {
  let peerId = useParams();

  return (
    <div>
      <UplinkComponent peerId={peerId}/>
      <DeviceMetrics />
    </div>
  );
}

export default App;
