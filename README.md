# Joel Kinman - WebGL/WebRTC Tech Demo

> A fully static, peer-to-peer 3D vaporwave experience with real-time device orientation control via WebRTC.

**Live Demo:** [https://jkinman.github.io/AngryMobRemote/](https://jkinman.github.io/AngryMobRemote/)

## Overview

This tech demo proves a concept I had: combining **WebRTC peer-to-peer communication** with **Three.js 3D graphics** and **device orientation APIs** to create a wireless, serverless camera control system. Your phone becomes a gyroscopic controller for a 3D scene running in your browser.

I wrapped the tech in a synthwave/vaporwave cyberpunk aesthetic because it looks DOPE!

### Key Features

- **100% Static** - No server-side code, hosted on GitHub Pages
- **Peer-to-Peer** - WebRTC data channels for real-time communication
- **Real-time 3D** - Three.js with custom post-processing pipeline
- **Device Orientation** - Accelerometer/gyroscope data from mobile devices
- **Cross-Platform** - Works on iOS and Android
- **Zero Latency** - Direct P2P connection, no server round-trips

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

## Cool Technical Features

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

### Device Orientation to Camera Control

Quaternion-based camera rotation using device sensors:

```javascript
setObjectQuaternion(quaternion, alpha, beta, gamma, orient)
├─ Convert Euler angles to quaternion
├─ Apply device orientation offset
└─ Update camera rotation matrix
```

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

### Modular Post-Processing

Each effect can be toggled independently with automatic render-to-screen management:

```javascript
updateRenderToScreen()
├─ Find last enabled pass in chain
├─ Set renderToScreen = true on last pass only
└─ Ensures output renders to canvas
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
