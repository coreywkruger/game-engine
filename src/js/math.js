import * as THREE from 'three';

class Interpolater {
  constructor(start, end, steps) {
    this.step = 0;
    this.steps = steps;
    this.start = start;
    this.end = end;
  }
  tick() {
    this.step++;
  }
  finished() {
    return this.step >= this.steps;
  }
}

class Vector3dInterpolation extends Interpolater {
  constructor(start, end, steps) {
    super(start, end, steps);
  }
  getCurrent() {
    let distance = this.end.distanceTo(this.start);
    if (distance == 0) {
      return this.end;
    }
    let newVector = this.start
      .clone()
      .add(
        new THREE.Vector3()
          .subVectors(this.end, this.start)
          .setLength((this.step * distance) / this.steps)
      );
    return newVector;
  }
}

class QuatInterpolation extends Interpolater {
  constructor(start, end, steps) {
    super(start, end, steps);
  }
  getCurrent() {
    if (this.end.equals(this.start)) {
      return this.end;
    }
    return this.start.setFromQuaternion(
      new THREE.Quaternion()
        .setFromEuler(this.start)
        .slerp(
          new THREE.Quaternion().setFromEuler(this.end),
          ((Math.PI / 2) * this.step) / this.steps
        ),
      'XYZ',
      true
    );
  }
}

class GravityPoint {
  constructor(pointMass) {
    this.g = 1;
    this.m1 = 1;
    this.m2 = pointMass;
  }
  setGravConstant(g) {
    this.g = 1;
  }
  setPointMass(m) {
    this.m2 = m;
  }
  setMass(m) {
    this.m1 = m;
  }
  apply(position, center) {
    let radiusX = position.x - center.x;
    let radiusY = position.y - center.y;
    let radiusZ = position.z - center.z;
    return new THREE.Vector3(
      position.x + (this.m1 * this.m2 * this.g) / (radiusX * radiusX),
      position.y + (this.m1 * this.m2 * this.g) / (radiusY * radiusY),
      position.z + (this.m1 * this.m2 * this.g) / (radiusZ * radiusZ)
    );
  }
}

export { Vector3dInterpolation, QuatInterpolation };
