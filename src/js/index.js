import {
  GameScene,
  GameEntity,
  KeyboardControls,
  Camera,
  Cylinder,
  Cube,
  LevelGroundPlayer,
  Sun
} from "idaho-ghola";

function initScene() {
  // make scene
  let scene = new GameScene();

  // initialize with a car object
  let id = Math.floor(Math.random() * 1000 + 1);
  let car = CreateCar(id);
  let carCam = new Camera(
    "cam1",
    95,
    window.innerWidth / window.innerHeight,
    1,
    1000000
  );
  carCam.setPosition(0, 9000, 20000);
  car.addChild(carCam);
  scene.addObject(car);
  scene.setActiveCamera(carCam);

  scene.addObject(new Sun("sun1", 0.8, 2, 0.8, 0xffffff, 0.8));
  scene.addObject(new Sun("sun2", -1, -0.4, -1, 0xffffff, 0.3));

  // cube stuff
  for (var i = 0; i < 20; i++) {
    let cube = new Cube(`cube-${i}`, 45000, 45000, 45000, 0x00ff00);
    cube.setPosition(
      Math.floor(Math.random() * 900000 - 900000 / 2 + 1),
      Math.floor(Math.random() * 100000 - 0 * 100000 / 2 + 1),
      Math.floor(Math.random() * 900000 - 900000 / 2 + 1)
    );
    scene.addObject(cube);
  } //

  // handle keyboard
  let keyboard = new KeyboardControls();

  // forward
  keyboard.createAction("87", function() {
    car.moveForward();
    car.getChild("front_right").rotateX(-0.01);
    car.getChild("front_left").rotateX(-0.01);
    car.getChild("rear_right").rotateX(-0.01);
    car.getChild("rear_left").rotateX(-0.01);
  });

  // backward
  keyboard.createAction("83", function() {
    car.moveBackward();
    car.getChild("front_right").rotateX(0.01);
    car.getChild("front_left").rotateX(0.01);
    car.getChild("rear_right").rotateX(0.01);
    car.getChild("rear_left").rotateX(0.01);
  });

  // left
  keyboard.createAction("65", function() {
    car.rotateLeft();
  });

  // right
  keyboard.createAction("68", function() {
    car.rotateRight();
  });

  document.addEventListener(
    "keydown",
    event => keyboard.onKeyDown(event.which),
    false
  );
  document.addEventListener(
    "keyup",
    event => keyboard.onKeyUp(event.which),
    false
  );
  // add canvas to page
  document.getElementById("view").appendChild(scene.getElement());

  return scene;
}

const SCENE = initScene();

animate();

function animate() {
  setTimeout(
    function() {
      requestAnimationFrame(animate);
    },
    1000 / 30
  );
  for (var i = 0; i < 20; i++) {
    let cube = SCENE.getObject(`cube-${i}`);
    cube.rotate(
      0.0003 * (i % 10 - 30),
      0.0003 * (i % 10 - 30),
      0.0003 * (i % 10 - 30)
    );
  }
  SCENE.render();
}

function CreateCar(id) {
  let cab = new Cube(`car-cab-${id}`, 4500, 4500, 15000, 0x00ffcc);

  var rear_left = new Cylinder("rear_left", 3000, 2000, 0xff0000);
  rear_left.setPosition(-5000, -5000, -9000);
  rear_left.setRotationZ(Math.PI / 2);

  var rear_right = new Cylinder("rear_right", 3000, 2000, 0xff0000);
  rear_right.setPosition(5000, -5000, -9000);
  rear_right.setRotationZ(Math.PI / 2);

  var front_left = new Cylinder("front_left", 3000, 2000, 0xff0000);
  front_left.setPosition(-5000, -5000, -1000);
  front_left.setRotationZ(Math.PI / 2);

  var front_right = new Cylinder("front_right", 3000, 2000, 0xff0000);
  front_right.setPosition(5000, -5000, -1000);
  front_right.setRotationZ(Math.PI / 2);

  let car = new LevelGroundPlayer(id);
  car.addChild(cab);
  car.addChild(rear_left);
  car.addChild(rear_right);
  car.addChild(front_left);
  car.addChild(front_right);

  return car;
}
