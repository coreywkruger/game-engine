import GameEntity from "./entity";
import * as THREE from "three";

class Sun extends GameEntity {
  constructor(name, dirx, diry, dirz, color, intensity) {
    var directionalLight = new THREE.DirectionalLight(0xffffff, intensity);
    directionalLight.position.x = dirx;
    directionalLight.position.y = diry;
    directionalLight.position.z = dirz;
    super(name, directionalLight);
  }
}

export { Sun };
