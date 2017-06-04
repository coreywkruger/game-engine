import * as THREE from "three";

class GameScene {
  constructor() {
    // scene
    this.mainScene = new THREE.Scene();

    // grid
    var gridHelper = new THREE.GridHelper(100000000, 1000);
    gridHelper.position.y = -5000;
    this.mainScene.add(gridHelper);

    // renderer
    this.mainRenderer = new THREE.WebGLRenderer({
      antialias: true,
      autoClear: true,
      alpha: true
    });
    this.mainRenderer.setSize(window.innerWidth, window.innerHeight);
    this.mainRenderer.setClearColor(0x000000);
    this.mainRenderer.setClear = true;
    this.objects = {};
  }
  getScene() {
    return this.mainScene;
  }
  setActiveCamera(cam) {
    this.mainCamera = cam.getAnchor();
    return this.mainCamera;
  }
  addObject(obj) {
    this.mainScene.add(obj.getAnchor());
    this.objects[obj.name] = obj;
  }
  deleteObject(id) {
    var ob = this.getObject(id);
    this.mainScene.remove(ob);
    delete this.objects[id];
  }
  getObject(id) {
    return this.objects[id];
  }
  getElement() {
    return this.mainRenderer.domElement;
  }
  render() {
    this.mainRenderer.render(this.mainScene, this.mainCamera);
  }
  addCamera(fov, aspect, near, far) {
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.y = 9000;
    camera.position.z = 23000;
    return camera;
  }
}

export default GameScene;
