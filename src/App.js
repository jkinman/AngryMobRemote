import './App.css';
import * as peerjs from './modules/WebRTCPeer.js'

function App() {

  const conneciton = peerjs.connect("9d64a6e7-767f-4e35-9ee3-fb866f3b4b5d")
  console.log( conneciton)
  return (
    <div>

    </div>
  );
}

export default App;
