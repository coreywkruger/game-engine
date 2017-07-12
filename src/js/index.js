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
import WebRTCClient from "webrtc-js";

const name = `TacoEater${Math.floor(Math.random() * 100000)}`;
const host = process.env.PEER_HOST;
const port = process.env.PEER_PORT;

// my peering service is a ws server
let WS = new WebSocket(`ws://${host}:${port}`);

// new client
let Client = new WebRTCClient({
  name
});

// send to peering service
Client.sendToPeerService = function(message) {
  WS.send(JSON.stringify(message));
};

// on message from peer service
WS.onmessage = function(message) {
  Client.processPeerData(JSON.parse(message.data));
};

let scene = new GameScene();
let car = CreateCar(Client.id);
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

WS.onopen = function() {
  // handle keyboard
  let keyboard = new KeyboardControls();

  // forward W
  keyboard.createAction("87", function() {
    car.moveForward();
    car.getChild("front_right").rotateX(-0.01);
    car.getChild("front_left").rotateX(-0.01);
    car.getChild("rear_right").rotateX(-0.01);
    car.getChild("rear_left").rotateX(-0.01);
  });

  // backward S
  keyboard.createAction("83", function() {
    car.moveBackward();
    car.getChild("front_right").rotateX(0.01);
    car.getChild("front_left").rotateX(0.01);
    car.getChild("rear_right").rotateX(0.01);
    car.getChild("rear_left").rotateX(0.01);
  });

  // left A
  keyboard.createAction("65", function() {
    car.rotateLeft();
  });

  // right D
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

  Client.onconnect = function(client_id) {
    scene.addObject(CreateCar(client_id));
  };

  Client.onremove = function(client_id) {
    scene.deleteObject(client_id);
  };

  Client.onavailableconnection = function() {
    // when a new peer becomes available for connection //
    Client.getAvailableConnections().forEach(connection => {
      if (!Client.getPeerByClientID(connection.to_client)) {
        // // if not already connected, connect
        Client.connect({
          client_id: connection.to_client,
          name: connection.name
        });
      }
    });
  };

  Client.onmessage = function(connectionID, data) {
    let message = JSON.parse(data);
    if (message.type === "entity") {
      let entity = scene.getObject(message.entity_id);
      if (entity) {
        switch (message.action) {
          case "translate":
            entity.setPositionInterpolation(message.x, message.y, message.z, 3);
            break;
          case "rotate":
            entity.setRotationInterpolation(message.x, message.y, message.z, 3);
            break;
          default:
            break;
        }
      }
    }
  };

  let pingTicker = new Ticker(function() {
    Client.ping();
  });
  let broadcastTicker = new Ticker(function() {
    let rotation = car.getRotation();
    Client.broadcast({
      entity_id: car.id,
      type: "entity",
      action: "rotate",
      x: rotation.x,
      y: rotation.y,
      z: rotation.z
    });
    let position = car.getPosition();
    Client.broadcast({
      entity_id: car.id,
      type: "entity",
      action: "translate",
      x: position.x,
      y: position.y,
      z: position.z
    });
  });

  const frameRate = 30;

  (function animate() {
    setTimeout(function() {
      scene.render();
      scene
        .getAllObjects()
        .filter(object => object instanceof LevelGroundPlayer)
        .forEach(object => {
          object.interpolatePosition();
          object.interpolateRotation();
        });
      broadcastTicker.tick(3);
      pingTicker.tick(frameRate * 5);
      requestAnimationFrame(animate);
    }, 1000 / frameRate);
  })();
};

function CreateCar(id) {
  let cab = new Cube(`car-cab-${id}`, 4500, 4500, 15000, 0x00ffcc);

  var rear_left = new Cylinder("rear_left", 3000, 2000, 0xff0000);
  rear_left.setPosition(-5000, -5000, 4000);
  rear_left.setRotationZ(Math.PI / 2);

  var rear_right = new Cylinder("rear_right", 3000, 2000, 0xff0000);
  rear_right.setPosition(5000, -5000, 4000);
  rear_right.setRotationZ(Math.PI / 2);

  var front_left = new Cylinder("front_left", 3000, 2000, 0xff0000);
  front_left.setPosition(-5000, -5000, -4000);
  front_left.setRotationZ(Math.PI / 2);

  var front_right = new Cylinder("front_right", 3000, 2000, 0xff0000);
  front_right.setPosition(5000, -5000, -4000);
  front_right.setRotationZ(Math.PI / 2);

  let car = new LevelGroundPlayer(id);
  car.addChild(cab);
  car.addChild(rear_left);
  car.addChild(rear_right);
  car.addChild(front_left);
  car.addChild(front_right);

  return car;
}

class Ticker {
  constructor(func) {
    this.frame = 0;
    this.func = func;
  }
  tick(time) {
    this.frame++;
    if (this.frame > time) {
      this.frame = 0;
      this.func();
      return true;
    }
    return false;
  }
}
