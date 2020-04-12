import { GameObject } from './object.js';
import * as THREE from 'three';

class Cube extends GameObject {
  constructor(name, w, h, d, color) {
    let mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
      })
    );
    super(name, mesh);
  }
}

class Cylinder extends GameObject {
  constructor(name, r, d, color) {
    let mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, d, 8),
      new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
      })
    );
    super(name, mesh);
  }
}

export { Cube, Cylinder };
