function Trees(world) {
    this.world = world;
    this.init();
  }
  
  Trees.prototype.init = function() {
  
    this.config = {
      height: 4.5,
      n: parseInt(Math.random() * 100),
    }
  
    var trees = new THREE.Object3D(),
        material = new THREE.MeshLambertMaterial({
          color: 0x9ACD32,
          flatShading: true,
        });
  
    for (var i=0; i<this.config.n; i++) {
      var h = this.config.height + Math.random() - Math.random(),
          r = h/5,
          geometry = new THREE.Geometry();
      geometry.vertices.push( new THREE.Vector3( 0, h, 0 ) ); // top
      geometry.vertices.push( new THREE.Vector3( -r, 0, r ) ); // sw
      geometry.vertices.push( new THREE.Vector3( r, 0, r ) ); // se
      geometry.vertices.push( new THREE.Vector3( r, 0, -r ) ); // ne
      geometry.vertices.push( new THREE.Vector3( -r, 0, -r ) ); // nw
      geometry.faces.push( new THREE.Face3( 1, 2, 0 ) ); // south
      geometry.faces.push( new THREE.Face3( 2, 3, 0 ) ); // east
      geometry.faces.push( new THREE.Face3( 3, 4, 0 ) ); // north
      geometry.faces.push( new THREE.Face3( 4, 1, 0 ) ); // west
      geometry.faces.push( new THREE.Face3( 3, 2, 1 ) ); // base, upside down, remember
      geometry.faces.push( new THREE.Face3( 4, 3, 1 ) ); // base
      geometry.computeFaceNormals();
      var tree = new THREE.Mesh(geometry, material),
          pos = this.world.land.getRandomSurfaceCoords(),
          halfLen = this.world.land.xLen/2;
      if (!pos.x || !pos.y || !pos.z ||
          (Math.abs(pos.x) + 2*r) > halfLen ||
          (Math.abs(pos.z) + 2*r) > halfLen ||
          pos.y > 30) continue; // limit tree altitude
      tree.position.set(pos.x, pos.y, pos.z);
      tree.rotation.y = Math.PI * Math.random() * 4;
      tree.name = 'tree';
      tree.castShadow = true;
      trees.add(tree)
    }
    trees.name = 'trees';
    this.world.scene.add(trees);
  }
  export default Trees