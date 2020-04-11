import * as game from './gameengine';
import { CreateCar } from './helpers.js';
import WebRTCClient from 'webrtc-js';

const worldActions = {
  translate: function (entity, message) {
    entity.setPositionInterpolation(message.x, message.y, message.z, 10);
  },
  rotate: function (entity, message) {
    entity.setRotationInterpolation(message.x, message.y, message.z, 10);
  },
};

const client = new WebRTCClient({ host: `${process.env.PEER_HOST}:${process.env.PEER_PORT}/register` });

client.onmessage = function(id, data) {
  let message = JSON.parse(data);
  if (message.type === 'entity') {
    let entity = world.getObject(message.entity_id);
    if (entity) {
      worldActions[message.action](entity, message);
    }
  }
};

client.onconnect = function(client_id) {
  world.add(CreateCar(client_id));
};

client.onremove = function(client_id) {
  world.deleteObject(client_id);
};

let world = new game.World();
let car = CreateCar(client.id);
let camera1 = new game.Camera('cam1', 35, window.innerWidth / window.innerHeight);

camera1.setPosition(0, 5000, 50000);
car.add(camera1);
world.add(car);

// keyboard
let keyboard = new game.Controls();
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

let listener = new game.Ticker(function() {
  client.ping();
});

let broadcaster = new game.Ticker(function () {
  let rotation = car.getRotation();
  client.broadcast({
    entity_id: car.name,
    type: 'entity',
    action: 'rotate',
    x: rotation.x,
    y: rotation.y,
    z: rotation.z,
  });
  let position = car.getPosition();
  client.broadcast({
    entity_id: car.name,
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
        if (object instanceof game.LevelGroundPlayer && object.id !== car.id) {
          return true;
        }
      })
      .forEach((object) => {
        object.interpolatePosition();
        object.interpolateRotation();
      });

    // broadcaster user coordinates
    broadcaster.tick(frameRate);
    // listen for other users coordinates
    listener.tick(frameRate * 5);

    requestAnimationFrame(animate);
  }, 1000 / frameRate);
})();
