import { GameEntity } from "./entity";
import * as THREE from "three";

class Camera extends GameEntity {
  constructor(name, fov, aspect, near, far){
    super(name, new THREE.PerspectiveCamera(fov, aspect, near || 1, far || 1000000));
    // renderer
    this.mainRenderer = new THREE.WebGLRenderer({
      antialias: true,
      autoClear: true,
      alpha: true
    });
    this.mainRenderer.setSize(2000, 1000);
    this.mainRenderer.setClearColor(0x000000);
    this.mainRenderer.setClear = true;
  }
  getElement() {
    return this.mainRenderer.domElement;
  }
  render(world) {
    this.mainRenderer.render(world.scene, this.getAnchor());
  }
}

export { Camera };
