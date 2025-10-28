# Joel Kinman - WebGL/WebRTC Tech Demo

Turn your phone into a wireless, gyroscopic controller for a 3D scene running in your browser. This project demonstrates real-time quaternion-based camera control by streaming device orientation data from a mobile device to a desktop browser over a peer-to-peer WebRTC connection - no servers, no backend, just pure client-side JavaScript and some interesting math.

The technical challenge was mapping the phone's accelerometer and gyroscope data (Euler angles: alpha, beta, gamma) into a Three.js camera quaternion that updates at 60 FPS with sub-frame latency. The WebRTC DataChannel handles the streaming, PeerJS manages the P2P handshake, and quaternion math converts device orientation into smooth camera rotation. The result is a responsive, wireless 3D controller that works on both iOS and Android.

I started with the concept of having a server and client component, then realized I could do this totally peer-to-peer with WebRTC data channels, and it wound up being this demo. Combining WebGL, WebRTC, device sensor data, and a gaming aesthetic.

I wrapped the tech in a synthwave/vaporwave cyberpunk aesthetic because it's fun.

**Live Demo:** [https://jkinman.github.io](https://jkinman.github.io)

---

## Tech Stack

### Frontend
- **React 18** - Modern hooks-based architecture
- **Three.js v0.180** - WebGL 3D rendering engine
- **PeerJS** - WebRTC wrapper for easy P2P connections
- **QRCode.js** - QR code generation for mobile pairing
- **SASS** - Modular stylesheets with variables

### 3D Graphics Pipeline
- **WebGL2** - Hardware-accelerated 3D rendering
- **EffectComposer** - Post-processing pipeline
- **UnrealBloomPass** - HDR bloom lighting effects
- **FilmPass** - Retro CRT scanline effects
- **RGBShiftShader** - Chromatic aberration with animated glitch system
- **Custom Terrain Generator** - Procedural vaporwave grid using Delaunay triangulation

### Device APIs
- **DeviceOrientationEvent** - Quaternion-based rotation (alpha, beta, gamma)
- **DeviceMotionEvent** - Accelerometer data
- **Screen Orientation API** - Handles device rotation

### Build Tools
- **Create React App** - Zero-config build system
- **Webpack** - Module bundler
- **Babel** - ES6+ transpilation

---

## Cool Technical Features

### Device Orientation to Camera Control

Quaternion-based camera rotation using device sensors:

```javascript
setObjectQuaternion(quaternion, alpha, beta, gamma, orient)
├─ Convert Euler angles to quaternion
├─ Apply device orientation offset
└─ Update camera rotation matrix
```

The phone's DeviceOrientationEvent fires at 60 FPS, providing alpha, beta, and gamma Euler angles. These are converted to a quaternion representation and applied directly to the Three.js camera's rotation matrix. The quaternion approach avoids gimbal lock and provides smooth interpolation between orientations. The WebRTC DataChannel maintains sub-frame latency, so camera movement feels instant - there's no perceptible lag between moving your phone and seeing the camera rotate.

### Zero-Server P2P Architecture

No backend required - everything runs client-side:
- PeerJS handles WebRTC signaling via public STUN server
- Data flows directly between devices
- Can be hosted on any static file server (GitHub Pages, S3, etc.)

### Cross-Platform Mobile Support

```javascript
// iOS 13+ permission handling
if (typeof DeviceMotionEvent.requestPermission === 'function') {
  await DeviceMotionEvent.requestPermission()
}

// Android auto-grants permissions
else {
  // Automatically link handlers
}
```

### Electromagnetic Disturbance System

Custom glitch effect that randomly spikes RGB chromatic aberration every 8-20 seconds, simulating electromagnetic interference:

```javascript
// Automated glitch cycle
- Random intervals (8-20 seconds)
- Variable intensity (80-120% of max)
- Smooth animation curve (ramp up → hold → fade)
- Duration: 200-500ms per spike
- Respects pass enabled state
```

### Modular Post-Processing

Each effect can be toggled independently with automatic render-to-screen management:

```javascript
updateRenderToScreen()
├─ Find last enabled pass in chain
├─ Set renderToScreen = true on last pass only
└─ Ensures output renders to canvas
```

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Browser (Desktop/Laptop)                  │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   React UI   │    │  WebRTC P2P  │    │  Three.js    │ │
│  │   (LCARS)    │◄──►│   (PeerJS)   │◄──►│   Scene      │ │
│  └──────────────┘    └──────┬───────┘    └──────────────┘ │
│                              │                              │
└──────────────────────────────┼──────────────────────────────┘
                               │
                    WebRTC DataChannel (P2P)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Mobile Device (Phone)                    │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │ Controller   │───►│  WebRTC P2P  │───►│  Device      │ │
│  │     UI       │    │   (PeerJS)   │    │ Orientation  │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Modular 3D Engine Architecture

```
src/modules/3d/
├── core/
│   ├── Camera.js               # CameraController class
│   │   ├─ PerspectiveCamera setup
│   │   ├─ OrbitControls integration
│   │   └─ Auto-rotate & resize handling
│   │
│   └── Renderer.js             # WebGLRendererWrapper class
│       ├─ WebGL2 configuration
│       ├─ Shadow mapping
│       └─ Pixel ratio optimization
│
├── scene/
│   └── VaporwaveScene.js       # Scene-specific logic
│       ├─ createTerrain()         → Procedural grid generation
│       ├─ setupLights()           → Ambient + spotlights
│       ├─ createPostProcessing()  → Effect pipeline
│       └─ Glitch System           → Animated EM disturbances
│
├── utils/
│   └── DebugTools.js           # Performance monitoring
│       ├─ Stats.js FPS counter
│       ├─ lil-gui controls
│       └─ Real-time effect toggles
│
├── SceneBase.js                # Main orchestrator
│   ├─ Lifecycle management
│   ├─ Animation loop
│   ├─ Device data → Camera rotation
│   └─ Coordinates all modules
│
├── AssetLoaders.js             # GLTF model loading
└── DeviceCameraTools.js        # Quaternion math for device orientation
```

### React Context Architecture

```
React Component Tree:
  <BrowserRouter>
    <AppProvider>                    # App state (UI, routing)
      <RTCProvider>                  # WebRTC connections
        <DeviceMetricsProvider>      # Device sensors
          <App>
            ├─ MainLayout             (Desktop view)
            │   ├─ LcarsHeader
            │   ├─ ConnectionStatus
            │   └─ UplinkComponent    (QR code)
            │
            ├─ ControllerLayout       (Mobile view)
            │   ├─ DeviceMetrics
            │   └─ AccelerometerDisplay
            │
            └─ Render3d               (3D scene)
                └─ SceneBase
                    ├─ Camera
                    ├─ Renderer
                    ├─ VaporwaveScene
                    └─ DebugTools
```

### Custom Hooks Pattern

```javascript
// Clean, reusable context access
useApp()            // App state (routing, UI)
useRTC()            // WebRTC connections
useDeviceMetrics()  // Device sensors
```

---

## Data Flow

### 1. Connection Establishment

```
Desktop Browser                          Mobile Device
      │                                        │
      ├─ Generate unique Peer ID               │
      │                                        │
      ├─ Generate QR code                      │
      │                                        │
      │              QR Code Scan               │
      │  ◄──────────────────────────────────── │
      │                                        │
      │         WebRTC Handshake               │
      │  ◄────────────────────────────────────►│
      │                                        │
      ├─ P2P DataChannel Established           │
      │  ═══════════════════════════════════►  │
```

### 2. Real-time Orientation Control

```
Mobile Device                Desktop Browser
      │                           │
      ├─ DeviceOrientationEvent   │
      │   (60 FPS)                │
      │                           │
      ├─ Extract quaternion       │
      │   (alpha, beta, gamma)    │
      │                           │
      ├─ Send via DataChannel     │
      ├──────────────────────────►│
                                  │
                   ┌──────────────┤
                   │ SceneBase    │
                   │  updateData()│
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │ CameraTools  │
                   │ cameraRotate()│
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │ Apply to     │
                   │ Camera       │
                   │ (Quaternion) │
                   └──────────────┘
                          │
                   ┌──────▼───────┐
                   │ Render Frame │
                   │   (60 FPS)   │
                   └──────────────┘
```

### 3. Post-Processing Pipeline

```
Scene Geometry
      │
      ▼
┌─────────────┐
│ RenderPass  │  Base scene rendering
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ GammaCorr.  │  Color correction
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ RGB Shift   │  Chromatic aberration (with glitch system)
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Bloom       │  HDR glow effects
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Film Pass   │  Scanlines & grain
└─────┬───────┘
      │
      ▼
  Final Output
  (to screen)
```

---

## Performance Features

- **Pixel Ratio Control** (0.5x - 2x) - Trade visual quality for FPS
- **Effect Toggles** - Disable expensive passes (Bloom, Film Grain)
- **Bloom Intensity** - Adjustable HDR strength (0-3.0)
- **Scanline Density** - Control Film Pass overhead (100-1000 lines)
- **Real-time FPS Monitor** - Stats.js integration
- **Dynamic Effect Pipeline** - Automatic renderToScreen management

---

## Local Development

### Prerequisites
```bash
Node.js v16+
npm or yarn
```

### Installation
```bash
git clone https://github.com/jkinman/AngryMobRemote.git
cd AngryMobRemote
npm install
```

### Development Server
```bash
npm start
# Runs on http://localhost:5001
```

### Production Build
```bash
npm run build
# Outputs to /build directory
```

### Testing Mobile Connection
For local development, use `ngrok` to expose your dev server to mobile devices:
```bash
ngrok http 5001
# Use the HTTPS URL on your mobile device
```

---

## Usage

### Desktop (Main Display)
1. Open the app in your browser
2. A QR code will be generated automatically
3. Wait for mobile device to connect
4. Click **FPS counter** to toggle debug controls
5. Adjust post-processing effects in real-time

### Mobile (Controller)
1. Scan QR code with your phone's camera
2. Tap "Enable device metrics" button (iOS only)
3. Grant sensor permissions
4. Move your phone to control the 3D camera

### Debug Controls
- **Pixel Ratio** - Rendering resolution multiplier
- **Enable RGB Shift** - Chromatic aberration on/off
- **Enable Bloom** - HDR glow on/off
- **Bloom Intensity** - Glow strength (0-3)
- **Enable Film Grain** - CRT scanlines on/off
- **Scanline Count** - Scanline density (100-1000)

**Advanced Controls:**
- **EM Disturbance Effect** - Automated glitch system
- **Min/Max Interval** - Glitch frequency (seconds)
- **Base RGB Shift** - Normal chromatic aberration amount
- **Max Glitch Intensity** - Peak distortion amount

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebRTC | Yes | Yes | Yes | Yes |
| WebGL2 | Yes | Yes | Yes | Yes |
| Device Orientation | Yes | Yes | Yes (iOS 13+) | Yes |
| Device Motion | Yes | Yes | Yes (iOS 13+) | Yes |

**Note:** iOS 13+ requires explicit user permission for device sensors.

---

## Project Structure

```
AngryMobRemote/
├── public/
│   ├── mesh/                    # GLTF 3D models
│   ├── textures/                # Skybox, terrain textures
│   └── Joel Kinman resume.pdf
│
├── src/
│   ├── contexts/                # React Context providers
│   │   ├── AppContext.jsx       # App state
│   │   ├── RTCContext.jsx       # WebRTC connections
│   │   └── DeviceMetricsContext.jsx  # Device sensors
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useApp.js
│   │   ├── useRTC.js
│   │   └── useDeviceMetrics.js
│   │
│   ├── modules/3d/              # Three.js engine
│   │   ├── core/                # Camera, Renderer
│   │   ├── scene/               # Scene generation
│   │   ├── utils/               # Debug tools
│   │   ├── SceneBase.js         # Main orchestrator
│   │   ├── AssetLoaders.js      # GLTF loading
│   │   ├── DeviceCameraTools.js # Quaternion math
│   │   └── Terrain.js           # Procedural generation
│   │
│   ├── pages/                   # Layout components
│   │   ├── MainLayout.jsx       # Desktop view
│   │   └── ControllerLayout.jsx # Mobile view
│   │
│   ├── smart/                   # Smart components
│   │   ├── UplinkComponent.jsx  # QR code + WebRTC
│   │   └── DeviceMetrics.jsx    # Sensor UI
│   │
│   ├── dumb/                    # Presentational components
│   │   ├── Render3d.jsx         # 3D scene container
│   │   ├── LcarsHeader.jsx      # Star Trek UI
│   │   ├── ConnectionStatus.jsx # RTC status
│   │   ├── AccelerometerDisplay.jsx
│   │   └── CyberPunkModal.jsx
│   │
│   ├── style/                   # SASS stylesheets
│   │   ├── App.scss
│   │   ├── _vars.scss
│   │   ├── _lcars.scss
│   │   └── cyberpunkbutton.scss
│   │
│   └── App.js                   # Root component
│
├── package.json
└── README.md
```

---

## Credits

### Technologies
- [Three.js](https://threejs.org/) - 3D graphics library
- [WebRTC](https://webrtc.org/) - Real-time communication
- [PeerJS](https://peerjs.com/) - WebRTC wrapper
- [React](https://react.dev/) - UI framework

### Assets
- **3D Model:** *"Sci-fi Vehicle 007 - public domain"* by [Unity Fan](https://sketchfab.com/unityfan777) - [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/)
- **LCARS UI:** Inspired by [TheLCARS.com](https://www.thelcars.com/)
- **Vaporwave Aesthetic:** Custom shaders and procedural generation

---

## License

MIT License - Feel free to use this code for your own projects!

---

## Author

**Joel Kinman**
- GitHub: [@jkinman](https://github.com/jkinman)
- LinkedIn: [Joel Kinman](https://www.linkedin.com/in/jkinman/)

---

**Built with care and lots of matrix math**
