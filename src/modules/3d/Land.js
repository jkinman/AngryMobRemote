import * as THREE from "three"

function Land(world) {
    this.world = world;
    this.land = null; // store for the object generated below
    this.config = {
      n: 17, // verts per side
      seed: 0, // seed for rng
      variation: 6, // degree of experimentation in layout
      colors: this.getColors(), // colors
      tileWidth: 10, // how large each square is
      heightScalar: 50, // how tall the scene is
      heightExp: 2.4, // higher vals make smoother terrain
      removeEdges: true, // lop off the edge pieces
    }
    this.domain = { // height (y-axis) domain
      max: Number.NEGATIVE_INFINITY,
      min: Number.POSITIVE_INFINITY,
    };
    this.render();
  }
  
  Land.prototype.getColors = function() {
    return {
      white0: new THREE.Color(0xFFFFFF),
      green0: new THREE.Color(0xD6D177),
      brown0: new THREE.Color(0x614126),
      brown1: new THREE.Color(0x8E5E39),
      brown2: new THREE.Color(0x705A3D),
    }
  }
  
  // return a 2D array with shape n,n where values contain heightmap
  Land.prototype.getDiamondSquare = function() {
  
    function rand(variation) {
      // return a random number 0:n
      return (Math.random() * 2 * variation) - variation;
    }
  
    function mean(arr) {
      // find the mean of 1D array `arr`
      return arr.reduce(function(sum, i) {
        return sum + i;
      }, 0) / arr.length;
    }
  
    function initialize() {
      // globals
      var n = this.config.n,
          variation = this.config.variation,
          seed = this.config.seed;
      // create empty 2D array
      var arr = new Array(this.config.n);
      for (var i=0; i<this.config.n; i++) {
        arr[i] = new Array(this.config.n);
      }
  
      // for consistent random number generation on first pass
      if (Math.randIters < 170) Math.seed = 154708;
  
      // initialize corner values
      arr[0][0] = seed += rand(variation);
      arr[0][n-1] = seed += rand(variation);
      arr[n-1][0] = seed += rand(variation);
      arr[n-1][n-1] = seed += rand(variation);
  
      // set the midpoint value
      var midpoint = parseInt(n/2);
      arr[midpoint][midpoint] = mean([
        arr[0][0],
        arr[0][n-1],
        arr[n-1][0],
        arr[n-1][n-1],
      ])
      // modify the values of `arr` to run the diamond star algorithm
      for (var step=n-1; step>=2; step/=2, variation/=2) {
        var halfStep = step/2;
        // square step
        for (var x=0; x<n-1; x+=step) {
          for (var y=0; y<n-1; y+=step) {
            // get each corner
            var tl = arr[x][y] == undefined ? seed : arr[x][y],
                tr = arr[x+step] == undefined ? seed : arr[x+step][y],
                br = arr[x+step] == undefined || arr[x+step][y+step] == undefined ? seed : arr[x+step][y+step],
                bl = arr[x][y+step] == undefined ? seed : arr[x][y+step];
            // smooth and perturb
            var average = mean([tl, tr, br, bl]) + rand(variation);
            arr[x+halfStep][y+halfStep] = average;
          }
        }
        // diamond step
        for (var x=0; x<n; x+=halfStep) {
          for (var y=(x+halfStep)%step; y<n; y+= step) {
            // find diamond corners
            var t = arr[x][(y-halfStep+n-1)%(n-1)],
                r = arr[(x+halfStep)%(n-1)][y],
                b = arr[x][(y+halfStep)%(n-1)],
                l = arr[(x-halfStep+n-1)%(n-1)][y];
            // perturb the average
            var average = mean([t,r,b,l]) + rand(variation);
            arr[x][y] = average;
          }
        }
      }
  
      return arr;
    }
    // run the diamond square algorithm
    arr = initialize.bind(this)();
  
    // lop off all edge pieces
    if (this.config.removeEdges) {
      arr = arr.slice(0, this.config.n-2);
      for (var i=0; i<arr.length; i++) {
        arr[i] = arr[i].slice(0, this.config.n-2);
      }
    }
  
    // exponentiate each point and store min and max
    var max = Number.NEGATIVE_INFINITY,
        min = Number.POSITIVE_INFINITY;
    for (var i=0; i<arr.length; i++) {
      for (var j=0; j<arr[i].length; j++) {
        arr[i][j] = Math.pow( Math.abs(arr[i][j]), this.config.heightExp);
        if (arr[i][j] < min) min = arr[i][j];
        if (arr[i][j] > max) max = arr[i][j];
      }
    }
  
    // scale all points 0:heightScalar
    var max = max-min,
        scale = this.config.heightScalar / max,
        max = max * scale;
    for (var i=0; i<arr.length; i++) {
      for (var j=0; j<arr[i].length; j++) {
        arr[i][j] = (arr[i][j]-min) * scale;
      }
    }
  
    // smooth out spikes; run lookups on array copy to stop cascading compression
    var arrCopy = JSON.parse(JSON.stringify(arr));
    for (var x=0; x<arr.length; x++) {
      for (var y=0; y<arr[x].length; y++) {
        // if any point is twice any neighbor, shrink it
        var shouldShrink = false;
        for (var dx=x-1; dx<=x+1; dx++) {
          for (var dy=y-1; dy<=y+1; dy++) {
            if (!Array.isArray(arr[dx]) || isNaN(arr[dx][dy]) || (x==dx && y==dy)) {
              continue;
            }
            var delta = arrCopy[x][y] - arrCopy[dx][dy];
            if (delta > arrCopy[x][y]/2) shouldShrink = true;
          }
        }
        if (shouldShrink) arr[x][y] *= 0.5;
      }
    }
  
    // find and store the new max in this.domain
    for (var x=0; x<arr.length; x++) {
      for (var y=0; y<arr[x].length; y++) {
        if (arr[x][y] > this.domain.max) this.domain.max = arr[x][y];
        if (arr[x][y] < this.domain.min) this.domain.min = arr[x][y];
      }
    }
  
    // if ~3% of squares aren't half the max required height, recompute
    var keepers = 0;
    for (var x=0; x<arr.length; x++) {
      for (var y=0; y<arr[x].length; y++) {
        if (arr[x][y] > this.config.heightScalar/2) {
          keepers++;
        }
      }
    }
  
    // either return the computed points or recompute if necessary
    var keepersRequired = (arr.length*arr[0].length) * 0.026666;
    return keepers > keepersRequired
      ? arr
      : this.getDiamondSquare();
  }
  
  Land.prototype.render = function() {
    var arr = this.getDiamondSquare(),
        land = new THREE.Object3D();
    land.name = 'land';
    for (var x=0; x<arr.length-1; x++) {
      for (var y=0; y<arr[x].length-1; y++) {
        var geometry = new THREE.BufferGeometry(),
            xWest = this.config.tileWidth * x,
            xEast = this.config.tileWidth + xWest,
            zNorth = this.config.tileWidth * y,
            zSouth = this.config.tileWidth + zNorth,
            yNorthWest = arr[x][y],
            ySouthWest = arr[x][y+1],
            yNorthEast = arr[x+1][y],
            ySouthEast = arr[x+1][y+1];
        geometry.points.push(new THREE.Vector3(xWest, yNorthWest, zNorth)); // nw
        geometry.points.push(new THREE.Vector3(xWest, ySouthWest, zSouth)); // sw
        geometry.points.push(new THREE.Vector3(xEast, yNorthEast, zNorth)); // ne
        geometry.points.push(new THREE.Vector3(xEast, ySouthEast, zSouth)); // se
        geometry.points.push(new THREE.Vector3(1, 2, 0)); // sw, ne, nw
        geometry.points.push(new THREE.Vector3(1, 3, 2)); // sw, se, ne
        geometry.faceVertexUvs[0].push([
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0, 1),
          new THREE.Vector2(1, 0),
        ]);
        geometry.faceVertexUvs[0].push([
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0, 1),
          new THREE.Vector2(1, 1),
        ]);
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        // build the material
        var material = new THREE.MeshLambertMaterial({
          flatShading: true,
        //   vertexColors: THREE.FaceColors,
          side: THREE.DoubleSide,
        });
        // add color to each face
        var height0 = Math.max(ySouthWest, yNorthEast, yNorthWest),
            height1 = Math.max(ySouthWest, ySouthEast, yNorthEast);
        var color0 = this.getColorAtHeight(height0);
        var color1 = this.getColorAtHeight(height1);
        geometry.faces[0].color = color0;
        geometry.faces[1].color = color1;
        // add the mesh to the group
        var mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        land.add(mesh);
      }
    }
    // store references to the lengths of each side
    this.xLen = (arr.length-1) * this.config.tileWidth;
    this.zLen = (arr[0].length-1) * this.config.tileWidth;
    this.land = land;
    this.addSides(arr);
    this.addBase();
    // translate the land to center it
    this.land.translateX(-this.xLen/2);
    this.land.translateZ(-this.zLen/2);
    this.land.updateMatrixWorld();
    // add the land to the scene
    this.world.scene.add(this.land);
  }
  
  Land.prototype.addSides = function(arr) {
    // add the the left x axis base
    var x0 = this.getSide(arr[0], THREE.FrontSide);
    x0.name = 'x0';
    x0.rotation.y = 270 * Math.PI/180;
    this.land.add(x0);
  
    // add the right x axis base -- near right on page load
    var arrX1 = arr[arr.length-1].slice().reverse(),
        x1 = this.getSide(arrX1, THREE.FrontSide);
    x1.name = 'x1';
    x1.rotation.y = 90 * Math.PI/180;
    x1.position.x += this.xLen;
    x1.position.z += this.zLen;
    this.land.add(x1);
  
    // add the left z axis base -- far right on page load
    var arrZ0 = [],
        arrZ1 = [];
    for (var i=0; i<arr.length; i++) {
      arrZ0.push(arr[i][0]);
      arrZ1.push(arr[i][arr[i].length-1]);
    }
    var z0 = this.getSide(arrZ0, THREE.BackSide);
    z0.name = 'z0';
    this.land.add(z0);
  
    // add the left z axis base -- near left on page load
    var z1 = this.getSide(arrZ1, THREE.FrontSide);
    z1.name = 'z1';
    z1.rotation.y = 0 * Math.PI/180;
    z1.position.z += this.zLen;
    this.land.add(z1);
  }
  
  Land.prototype.getSide = function(arr, sideType) {
    var side = new THREE.Object3D(),
        lightMaterial = new THREE.MeshLambertMaterial({
          color: this.config.colors.brown1,
          flatShading: true,
          side: sideType,
        }),
        darkMaterial = new THREE.MeshLambertMaterial({
          color: this.config.colors.brown0,
          flatShading: true,
          side: sideType,
        });
    for (var i=0; i<arr.length-1; i++) {
      // top soil
      var xLeft = this.config.tileWidth*i,
          xRight = xLeft + this.config.tileWidth,
          yTopLeft = arr[i],
          yTopRight = arr[i+1],
          yMiddleLeft = (yTopLeft - this.domain.max)/3,
          yMiddleRight = (yTopRight - this.domain.max)/3;
      var geometry = new THREE.BufferGeometry();
      geometry.points.push(new THREE.Vector3(xLeft, yMiddleLeft, 0));
      geometry.points.push(new THREE.Vector3(xRight, yTopRight, 0));
      geometry.points.push(new THREE.Vector3(xLeft, yTopLeft, 0));
      geometry.points.push(new THREE.Vector3(xRight, yMiddleRight, 0));
      geometry.points.push(new THREE.Vector3(0,1,2));
      geometry.points.push(new THREE.Vector3(0,3,1));
      var mesh = new THREE.Mesh(geometry, lightMaterial);
      side.add(mesh);
      // bottom soil
      var yBottom = -this.domain.max/2,
          geometry = new THREE.BufferGeometry();
      geometry.points.push(new THREE.Vector3(xLeft, yBottom, 0));
      geometry.points.push(new THREE.Vector3(xRight, yMiddleRight, 0));
      geometry.points.push(new THREE.Vector3(xLeft, yMiddleLeft, 0));
      geometry.points.push(new THREE.Vector3(xRight, yBottom, 0));
      geometry.points.push(new THREE.Vector3(0,1,2));
      geometry.points.push(new THREE.Vector3(0,3,1));
      geometry.computeFaceNormals();
      var mesh = new THREE.Mesh(geometry, darkMaterial)
      side.add(mesh);
    }
    return side;
  }
  
  Land.prototype.addBase = function() {
    var material = new THREE.MeshLambertMaterial({
      color: 0x614126,
    //   shading: THREE.FlatShading,
      side: THREE.DoubleSide,
    })
    var geometry = new THREE.PlaneBufferGeometry(this.xLen, this.zLen, 1);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -this.domain.max/2;
    mesh.position.x = this.xLen/2;
    mesh.position.z = this.zLen/2;
    mesh.rotation.x = Math.PI/2;
    mesh.name = 'base';
    this.land.add(mesh);
  }
  
  Land.prototype.getColorAtHeight = function(height) {
    if (height/this.domain.max >= 0.8) return this.config.colors.white0;
    if (height/this.domain.max >= 0.49) return this.config.colors.brown0;
    return this.config.colors.green0;
  }
  
  Land.prototype.getRandomSurfaceCoords = function() {
    var min = -this.xLen/2,
        max = this.xLen/2,
        x = min + (Math.random() * (max-min)),
        z = min + (Math.random() * (max-min));
    return {
      x: x,
      y: this.getHeightAt({x: x, z: z}),
      z: z,
    }
  }
  
  Land.prototype.getHeightAt = function(pos) {
    pos.y = 100; // random height above terrain
    var raycaster = new THREE.Raycaster();
    raycaster.set(pos, new THREE.Vector3(0, -1, 0));
    var intersects = raycaster.intersectObject(this.land, true);
    return intersects.length
      ? intersects[0].point.y
      : null;
  }

  export default Land