import React, { useEffect, useContext } from 'react'
import './App.css';

// context
import { AppContext } from './contexts/AppContext';
import UplinkComponent from './smart/UplinkComponent';

function App() {

  return (
    <div>
      <UplinkComponent />
    </div>
  );
}

export default App;
