import * as THREE from 'three';

class World {
  constructor() {
    this.scene = new THREE.Scene();

    // grid
    var gridHelper = new THREE.GridHelper(10000000, 1000);
    gridHelper.position.y = -5000;
    this.scene.add(gridHelper);
    this.objects = {};
  }
  add(obj) {
    this.scene.add(obj.getAnchor());
    this.objects[obj.name] = obj;
  }
  deleteObject(id) {
    var ob = this.getObject(id);
    this.scene.remove(ob);
    delete this.objects[id];
  }
  getObject(id) {
    return this.objects[id];
  }
  getAllObjects() {
    let objects = [];
    for (var key in this.objects) {
      objects.push(this.objects[key]);
    }
    return objects;
  }
}

export { World };
