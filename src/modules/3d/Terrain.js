/*
* Random number generation
**/

Math.seed = Math.initialSeed = window.location.search
  ? parseInt(window.location.search.substring(1).replace('seed=',''))
  : 219883;
Math.randIters = 0;
Math.random = function() {
  Math.randIters++;
  if (Math.seed == -1) return Math.random();
  var max = 1,
      min = 0;
  Math.seed = (Math.seed * 9301 + 49297) % 233280;
  var result = min + (Math.seed/233280) * (max-min);
  return result;
}

function World(obj) {
  this.init(obj);
  this.land = new Land(this);
  this.trees = new Trees(this);
}

World.prototype.init = function(obj) {
  var obj = obj || {},
      container = obj.container || document.querySelector('body'),
      w = container.clientWidth,
      h = container.clientHeight;
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(75, w/h, 0.001, 10000);
  this.controls = new THREE.OrbitControls(this.camera, this.container);
  var renderConfig = {antialias: true, alpha: true};
  this.renderer = new THREE.WebGLRenderer(renderConfig);
  this.renderer.shadowMap.enabled = true;
  this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  this.controls.target = new THREE.Vector3(0, 0, 0.75);
  this.camera.position.set(130, 85, 130);
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setSize(w, h);
  container.appendChild(this.renderer.domElement);

  // directional light / sunlight
  var directional_light = new THREE.DirectionalLight(0xff9900, 0.55);
  directional_light.position.set(50, 60, -25);
  directional_light.castShadow = true;
  directional_light.shadow.camera.near = 10;
  directional_light.shadow.camera.far = 250;
  directional_light.shadow.camera.right = 100;
  directional_light.shadow.camera.left = -100;
  directional_light.shadow.camera.top = 100;
  directional_light.shadow.camera.bottom = -100;
  directional_light.shadow.mapSize.width = 5000;
  directional_light.shadow.mapSize.height = 5000;
  this.scene.add(directional_light);

  // ambient light
  var ambientLight = new THREE.AmbientLight(0x666666);
  this.scene.add(ambientLight);

  // axis helper on demand
  if (window.location.search.indexOf('axis=true') > -1) {
    var axesHelper = new THREE.AxesHelper(5000);
    this.scene.add(axesHelper)
  }

  // add resize listener
  window.addEventListener('resize', function() {
    this.camera.aspect = container.clientWidth/container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }.bind(this))

  this.render();
}

World.prototype.render = function() {
  requestAnimationFrame(this.render.bind(this));
  this.renderer.render(this.scene, this.camera);
  this.controls.update();
  if (this.land && this.land.land) {
    //this.land.land.rotateOnAxis(new THREE.Vector3(0.0,0.0,0), 1.0);
    //this.land.land.rotation.y += 0.01;
  }
}



/**
* Main
**/

var world = new World({
  container: document.querySelector('#mountain-target'),
});
