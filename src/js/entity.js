import * as THREE from "three";

class GameEntity {
  constructor(name, object) {
    this.anchor = object || new THREE.Object3D();
    this.name = name;
    this.children = {};
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

  addChild(child) {
    this.anchor.add(child.getAnchor());
    this.children[child.name] = child;
  }
}

export default GameEntity;
