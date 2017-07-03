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

const host = process.env.HOST;
const port = process.env.PORT;

// my peering service is a ws server in this example
let WS = new WebSocket(`ws://${host}:${port}`);

// new client
let Client = new WebRTCClient();
const name = `TacoEater${Math.floor(Math.random() * 100000)}`;
Client.setName(name);

// send to peering service
Client.sendToServer = function(message) {
  message.name = Client.name;
  WS.send(JSON.stringify(message));
};

// on message from peering service
WS.onmessage = function(message) {
  if (open) {
    // only receive new messages if allowed
    Client.onServerMessage(JSON.parse(message.data));
  }
};

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

  let connected = {};

  Client.onconnect = function(client_id) {
    if (!connected[client_id]) {
      connected[client_id] = Client.getConnectionsByClientID(client_id)[0];
      let player = CreateCar(client_id);
      scene.addObject(player);
    }
  };

  Client.onremove = function(client_id) {};

  Client.onavailableconnection = function() {
    // when a new peer becomes available for connection
    Client.getAvailableConnections().forEach(connection => {
      if (!connected[connection.from_client]) {
        // // if not already connected, connect
        Client.connect({
          client_id: connection.from_client,
          name: connection.name
        });
      }
    });
  };

  Client.onmessage = function(connectionID, data) {
    let message = JSON.parse(data);
    let peer = Client.getPeer(connectionID);
    let player = scene.getObject(message.id);
    if (!player) {
      return;
    }
    // message is just a message
    if (message.type === "translate") {
      player.createPositionInterpolation(message.x, message.y, message.z, 5);
    } else if (message.type === "rotate") {
      console.log("here")
      player.createEulerInterpolation(message.x, message.y, message.z, 5);
    }
  };

  let pingTicker = new Ticker(function() {
    Client.ping();
  });
  let broadcastTicker = new Ticker(function() {
    let rotation = car.getRotation();
    Client.broadcast({
      id: Client.id,
      type: "rotate",
      x: rotation.x,
      y: rotation.y,
      z: rotation.z
    });
    let position = car.getPosition();
    Client.broadcast({
      id: Client.id,
      type: "translate",
      x: position.x,
      y: position.y,
      z: position.z
    });
  });

  (function animate() {
    setTimeout(function() {
      scene.render();

      let players = [];
      let allObjects = scene.getAllObjects();
      for (var i = 0; i < allObjects.length; i++) {
        if (allObjects[i] instanceof LevelGroundPlayer) {
          allObjects[i].interpolatePosition();
          allObjects[i].interpolateRotation();
        }
      }
      broadcastTicker.tick(3);
      pingTicker.tick(30 * 5);

      requestAnimationFrame(animate);
    }, 1000 / 30);
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
