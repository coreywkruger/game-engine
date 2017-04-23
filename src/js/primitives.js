import GameEntity from "./entity";
import * as THREE from "three";

class Cube extends GameEntity {
  constructor(name, w, h, d, color) {
    let mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshLambertMaterial({
        color: color
      })
    );
    super(name, mesh);
  }
}

class Cylinder extends GameEntity {
  constructor(name, r, d, color) {
    let mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, d, 8),
      new THREE.MeshLambertMaterial({
        color: color
      })
    );
    super(name, mesh);
  }
}

export { Cube, Cylinder };
