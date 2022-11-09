import React, { useEffect, useContext } from 'react'
import './App.css';

// context
import { DeviceMetricsContext } from './contexts/DeviceMetricsContext';
import UplinkComponent from './smart/UplinkComponent';
import DeviceMetrics from './smart/DeviceMetrics';

function App() {

  return (
    <div>
      <UplinkComponent />
      <DeviceMetrics />
    </div>
  );
}

export default App;
