import GameEntity from "./entity";
import * as THREE from "three";

class Camera extends GameEntity {
  constructor(name, fov, aspect, near, far){
    super(name, new THREE.PerspectiveCamera(fov, aspect, near, far));
  }
}

export default Camera;