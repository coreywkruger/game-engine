import { GameObject } from './object.js';
import * as THREE from 'three';

class LevelGroundPlayer extends GameObject {
  constructor(id) {
    super(id);
  }
  moveForward() {
    var direction = this.getAnchor().matrix.elements;
    var directionVector = new THREE.Vector3(
      direction[8],
      direction[9],
      direction[10]
    );
    this.getAnchor().position.add(directionVector.clone().setLength(-300));
  }

  moveBackward() {
    var direction = this.getAnchor().matrix.elements;
    var directionVector = new THREE.Vector3(
      direction[8],
      direction[9],
      direction[10]
    );
    this.getAnchor().position.add(directionVector.clone().setLength(300));
  }
}

export { LevelGroundPlayer };
