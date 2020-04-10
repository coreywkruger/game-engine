import { CreateCar } from './helpers.js';
import { Ticker } from './clock.js';
import { Controls } from './controls.js';
import { World } from './world.js';
import { Camera } from './camera.js';
import { Sun } from './light.js';
import { LevelGroundPlayer } from './player.js';
import WebRTCClient from 'webrtc-js';

const worldActions = {
  translate: function (entity, message) {
    entity.setPositionInterpolation(message.x, message.y, message.z, 10);
  },
  rotate: function (entity, message) {
    entity.setRotationInterpolation(message.x, message.y, message.z, 10);
  },
};

// my peering service is a ws server
let Connection = new WebSocket(
  `ws://${process.env.PEER_HOST}:${process.env.PEER_PORT}`
);

const CONNECTION_NAME = `taco-eater-${Math.floor(Math.random() * 100000)}`;
// new client
let Client = new WebRTCClient({ CONNECTION_NAME });

// send to peering service
Client.sendToPeerService = function (message) {
  Connection.send(JSON.stringify(message));
};

// on message from peer service
Connection.onmessage = function (message) {
  Client.processPeerData(JSON.parse(message.data));
};

Connection.onopen = function () {
  Client.onconnect = function (client_id) {
    world.add(CreateCar(client_id));
  };

  Client.onremove = function (client_id) {
    world.deleteObject(client_id);
  };

  Client.onavailableconnection = function () {
    // when a new peer becomes available for connection
    Client.getAvailableConnections().forEach((connection) => {
      if (!Client.getPeerByClientID(connection.to_client)) {
        // if not already connected, connect
        Client.connect({
          client_id: connection.to_client,
          name: connection.name,
        });
      }
    });
  };

  Client.onmessage = function (connectionID, data) {
    let message = JSON.parse(data);
    if (message.type === 'entity') {
      let entity = world.getObject(message.entity_id);
      if (entity) {
        worldActions[message.action](entity, message);
      }
    }
  };
};

let world = new World();
let car = CreateCar(Client.id);
let camera1 = new Camera('cam1', 35, window.innerWidth / window.innerHeight);

camera1.setPosition(0, 5000, 50000);
car.add(camera1);
world.add(car);

// keyboard
let keyboard = new Controls();
// forward
keyboard.bindKey('w', function () {
  car.moveForward();
});
// backward
keyboard.bindKey('s', function () {
  car.moveBackward();
});
// left
keyboard.bindKey('a', function () {
  car.rotateLeft();
});
// right
keyboard.bindKey('d', function () {
  car.rotateRight();
});

let listener = new Ticker(Client.ping);

let broadcaster = new Ticker(function () {
  let rotation = car.getRotation();
  Client.broadcast({
    entity_id: car.id,
    type: 'entity',
    action: 'rotate',
    x: rotation.x,
    y: rotation.y,
    z: rotation.z,
  });
  let position = car.getPosition();
  Client.broadcast({
    entity_id: car.id,
    type: 'entity',
    action: 'translate',
    x: position.x,
    y: position.y,
    z: position.z,
  });
});

// add canvas to page
document.getElementById('view').appendChild(camera1.getCanvas());
document.addEventListener(
  'keydown',
  (event) => {
    keyboard.onKeyDown(event.key);
  },
  false
);
document.addEventListener(
  'keyup',
  (event) => {
    keyboard.onKeyUp(event.key);
  },
  false
);

// 30 frames per second
const frameRate = 30;

(function animate() {
  setTimeout(function () {
    // render world on canvase
    camera1.render(world);

    // update all object positions
    world
      .getAllObjects()
      .filter((object) => {
        if (object instanceof LevelGroundPlayer && object.id !== car.id) {
          return true;
        }
      })
      .forEach((object) => {
        object.interpolatePosition();
        object.interpolateRotation();
      });

    // // broadcaster user coordinates
    // broadcaster.tick(3);
    // // listen for other users coordinates
    // listener.tick(frameRate * 5);

    requestAnimationFrame(animate);
  }, 1000 / frameRate);
})();
