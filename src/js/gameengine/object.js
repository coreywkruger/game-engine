import * as THREE from "three";
import * as GameMath from "./math.js";

class GameObject {
  constructor(name, object) {
    this.anchor = object || new THREE.Object3D();
    this.name = name;
    this.children = {};

    this.position_interpolation = null
    this.rotation_interpolation = null
  }

  getPosition() {
    return {
      x: this.anchor.position.x,
      y: this.anchor.position.y,
      z: this.anchor.position.z,
    };
  }

  getRotation() {
    return {
      x: this.anchor.rotation.x,
      y: this.anchor.rotation.y,
      z: this.anchor.rotation.z,
    };
  }

  translate(x, y, z) {
    this.translateX(x);
    this.translateY(y);
    this.translateZ(z);
  }

  translateX(x) {
    this.setPositionX(this.getAnchor().position.x + x);
  }

  translateY(y) {
    this.setPositionY(this.getAnchor().position.y + y);
  }

  translateZ(z) {
    this.setPositionZ(this.getAnchor().position.z + z);
  }

  setPosition(x, y, z) {
    this.setPositionX(x);
    this.setPositionY(y);
    this.setPositionZ(z);
  }

  setPositionX(x) {
    this.anchor.position.x = x ? x : this.anchor.position.x;
  }

  setPositionZ(z) {
    this.anchor.position.z = z ? z : this.anchor.position.z;
  }

  setPositionY(y) {
    this.anchor.position.y = y ? y : this.anchor.position.y;
  }

  setRotation(x, y, z) {
    this.setRotationX(x);
    this.setRotationY(y);
    this.setRotationZ(z);
  }

  rotate(x, y, z) {
    this.rotateX(x);
    this.rotateY(y);
    this.rotateZ(z);
  }

  rotateX(x) {
    this.setRotationX(this.getAnchor().rotation.x + x);
  }

  rotateY(y) {
    this.setRotationY(this.getAnchor().rotation.y + y);
  }

  rotateZ(z) {
    this.setRotationZ(this.getAnchor().rotation.z + z);
  }

  setRotationX(x) {
    this.anchor.rotation.x = x ? x : this.anchor.rotation.x;
  }

  setRotationZ(z) {
    this.anchor.rotation.z = z ? z : this.anchor.rotation.z;
  }

  setRotationY(y) {
    this.anchor.rotation.y = y ? y : this.anchor.rotation.y;
  }

  rotateLeft() {
    this.anchor.rotation.y += Math.PI / 460;
  }

  rotateRight() {
    this.anchor.rotation.y -= Math.PI / 460;
  }

  getChild(name) {
    return this.children[name];
  }

  getAnchor() {
    return this.anchor;
  }

  add(child) {
    this.anchor.add(child.getAnchor());
    this.children[child.name] = child;
  }

  setPositionInterpolation(x, y, z, steps) {
    this.position_interpolation = new GameMath.Vector3dInterpolation(
      this.anchor.position.clone(),
      new THREE.Vector3(x, y, z),
      steps
    );
  }

  setRotationInterpolation(x, y, z, steps) {
    this.rotation_interpolation = new GameMath.QuatInterpolation(
      this.anchor.rotation.clone(),
      new THREE.Euler(x, y, z, "XYZ"),
      steps
    );
  }

  interpolatePosition() {
    if (this.position_interpolation !== null) {
      if (!this.position_interpolation.finished()) {
        this.position_interpolation.tick();
        this.anchor.position.copy(this.position_interpolation.getCurrent());
      } else {
        this.position_interpolation = null;
      }
    }
  }

  interpolateRotation() {
    if (this.rotation_interpolation !== null) {
      if (!this.rotation_interpolation.finished()) {
        this.rotation_interpolation.tick();
        this.anchor.rotation.copy(this.rotation_interpolation.getCurrent());
      } else {
        this.rotation_interpolation = null;
      }
    }
  }

  interpolateCoordinates() {
    this.interpolatePosition();
    this.interpolateRotation();
  }
}

export { GameObject };
