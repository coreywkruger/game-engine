import { GameObject } from './object.js';
import * as THREE from 'three';

class Camera extends GameObject {
  constructor(name, fov, width, height, near, far) {
    super(
      name,
      new THREE.PerspectiveCamera(fov, width / height, near || 1, far || 1000000)
    );

    this.mainRenderer = new THREE.WebGLRenderer({
      antialias: true,
      autoClear: true,
      alpha: true,
    });
    this.mainRenderer.setSize(width, height);
    this.mainRenderer.setClearColor(0x000000);
    this.mainRenderer.setClear = true;
  }
  getCanvas() {
    return this.mainRenderer.domElement;
  }
  render(world) {
    this.mainRenderer.render(world.scene, this.getAnchor());
  }
}

export { Camera };
