import * as THREE from "three";

const GameScene = function() {
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
};

GameScene.prototype.getScene = function() {
  return this.mainScene;
};

GameScene.prototype.setActiveCamera = function(cam) {
  this.mainCamera = cam.getAnchor();
  return this.mainCamera;
};

GameScene.prototype.addObject = function(obj) {
  this.mainScene.add(obj.getAnchor());
  this.objects[obj.name] = obj;
};

GameScene.prototype.deleteObject = function(id) {
  var ob = this.getObject(id);
  this.mainScene.remove(ob);
  delete this.objects[id];
};

GameScene.prototype.getObject = function(id) {
  return this.objects[id];
};

GameScene.prototype.getElement = function() {
  return this.mainRenderer.domElement;
};

GameScene.prototype.render = function() {
  this.mainRenderer.render(this.mainScene, this.mainCamera);
};

GameScene.prototype.addCamera = function(fov, aspect, near, far) {
  var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.y = 9000;
  camera.position.z = 23000;
  return camera;
};

function setRenderer(width, height, aspect) {
  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    autoClear: true,
    alpha: true
  });
  renderer.setSize(width, height * aspect);
  renderer.setClearColor(0x000000);
  renderer.setClear = true;
  return renderer;
}

export default GameScene;
