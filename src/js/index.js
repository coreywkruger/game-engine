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

function initScene() {
  const host = process.env.HOST;
  const port = process.env.PORT;

  // my peering service is a ws server in this example
  let WS = new WebSocket(`ws://${host}:${port}`);

  // new client
  let Client = new WebRTCClient();
  Client.setName(`TacoEater${Math.floor(Math.random() * 100000)}`);

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
    // // cube stuff
    // for (var i = 0; i < 20; i++) {
    //   let cube = new Cube(`cube-${i}`, 45000, 45000, 45000, 0x00ff00);
    //   cube.setPosition(
    //     Math.floor(Math.random() * 900000 - 900000 / 2 + 1),
    //     Math.floor(Math.random() * 100000 - 0 * 100000 / 2 + 1),
    //     Math.floor(Math.random() * 900000 - 900000 / 2 + 1)
    //   );
    //   scene.addObject(cube);
    // } //

    (function ping() {
      Client.ping();
      setTimeout(ping, 5000);
    })();

    // handle keyboard
    let keyboard = new KeyboardControls();

    // forward
    keyboard.createAction("87", function() {
      car.moveForward();
      car.getChild("front_right").rotateX(-0.01);
      car.getChild("front_left").rotateX(-0.01);
      car.getChild("rear_right").rotateX(-0.01);
      car.getChild("rear_left").rotateX(-0.01);
      let rotation = car.getAnchor().rotation;
      Client.broadcast({
        id: Client.id,
        type: "rotate",
        x: rotation.x,
        y: rotation.y,
        z: rotation.z
      });
      let position = car.getAnchor().position;
      Client.broadcast({
        id: Client.id,
        type: "translate",
        x: position.x,
        y: position.y,
        z: position.z
      });
    });

    // backward
    keyboard.createAction("83", function() {
      car.moveBackward();
      car.getChild("front_right").rotateX(0.01);
      car.getChild("front_left").rotateX(0.01);
      car.getChild("rear_right").rotateX(0.01);
      car.getChild("rear_left").rotateX(0.01);
      let rotation = car.getAnchor().rotation;
      Client.broadcast({
        id: Client.id,
        type: "rotate",
        ...rotation
      });
      let position = car.getAnchor().position;
      Client.broadcast({
        id: Client.id,
        type: "translate",
        ...position
      });
    });

    // left
    keyboard.createAction("65", function() {
      car.rotateLeft();
      let rotation = car.getAnchor().rotation;
      Client.broadcast({
        id: Client.id,
        type: "rotate",
        ...rotation
      });
    });

    // right
    keyboard.createAction("68", function() {
      car.rotateRight();
      let rotation = car.getAnchor().rotation;
      Client.broadcast({
        id: Client.id,
        type: "rotate",
        ...rotation
      });
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

    ///
    ///
    ///
    ///
    ///

    let connected = {};

    Client.onconnect = function() {
      Client.getOpenConnections().forEach(c => {
        if (!connected[c.to_client]) {
          connected[c.to_client] = c;
          ///
          ///
          /// add new player
          let player = CreateCar(c.to_client);
          scene.addObject(player);
        }
      });
    };

    Client.onavailableconnection = function() {
      // when a new peer becomes available for connection
      Client.getAvailableConnections().map(connection => {
        if (!Client.getConnectionsByClientID(connection.from_client).length) {
          // if not already connected, connect
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
      // message is just a message
      if (message.type === "translate") {
        let player = scene.getObject(message.id);
        player.setPosition(message.x, message.y, message.z);
      } else if (message.type === "rotate") {
        let player = scene.getObject(message.id);
        player.setRotation(message.x, message.y, message.z);
      }
    };
  };

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
  // for (var i = 0; i < 20; i++) {
  //   let cube = SCENE.getObject(`cube-${i}`);
  //   cube.rotate(
  //     0.0003 * (i % 10 - 30),
  //     0.0003 * (i % 10 - 30),
  //     0.0003 * (i % 10 - 30)
  //   );
  // }
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
