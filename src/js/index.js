import { CreateCar } from './helpers.js';
import { Ticker } from './clock.js';
import { Controls } from './controls.js';
import { World } from './world.js';
import { Camera } from './camera.js';
import { Sun } from './light.js';
import { LevelGroundPlayer } from './player.js';
import WebRTCClient from "webrtc-js";

const name = `taco-eater-${Math.floor(Math.random() * 100000)}`;

// my peering service is a ws server
let Connection = new WebSocket(`ws://${process.env.PEER_HOST}:${process.env.PEER_PORT}`);

// new client
let Client = new WebRTCClient({ name });

// send to peering service
Client.sendToPeerService = function(message) {
  Connection.send(JSON.stringify(message));
};

// on message from peer service
Connection.onmessage = function(message) {
  Client.processPeerData(JSON.parse(message.data));
};

let world = new World();
let car = CreateCar(Client.id);
let camera1 = new Camera('cam1', 35, window.innerWidth / window.innerHeight);

camera1.setPosition(0, 5000, 50000);
car.addChild(camera1);
world.addObject(car);
// world.setActiveCamera(camera1);

world.addObject(new Sun('sun1', 0.8, 2, 0.8, 0xffffff, 0.8));
world.addObject(new Sun('sun2', -1, -0.4, -1, 0xffffff, 0.3));

const worldActions = {
  'translate': function(entity, message) {
    entity.setPositionInterpolation(message.x, message.y, message.z, 3);
  },
  'rotate': function(entity, message) {
    entity.setRotationInterpolation(message.x, message.y, message.z, 3);
  }
};

Connection.onopen = function() {
  Client.onconnect = function(client_id) {
    world.addObject(CreateCar(client_id));
  };
  
  Client.onremove = function(client_id) {
    world.deleteObject(client_id);
  };
  
  Client.onavailableconnection = function() {
    // when a new peer becomes available for connection //
    Client.getAvailableConnections().forEach(connection => {
      if (!Client.getPeerByClientID(connection.to_client)) {
        // if not already connected, connect
        Client.connect({
          client_id: connection.to_client,
          name: connection.name
        });
      }
    });
  };
  
  Client.onmessage = function(connectionID, data) {
    let message = JSON.parse(data);
    if (message.type === 'entity') {
      let entity = world.getObject(message.entity_id);
      if (entity) {
        worldActions[message.action](entity, message);
      }
    }
  };
};

// handle keyboard
let keyboard = new Controls();

// forward W
keyboard.createAction('w', function() {
  car.moveForward();
  // rotate wheels forward
  car.getChild('front_right').rotateX(-0.01);
  car.getChild('front_left').rotateX(-0.01);
  car.getChild('rear_right').rotateX(-0.01);
  car.getChild('rear_left').rotateX(-0.01);
});

// backward S
keyboard.createAction('s', function() {
  car.moveBackward();
  // rotate wheels backward
  car.getChild('front_right').rotateX(0.01);
  car.getChild('front_left').rotateX(0.01);
  car.getChild('rear_right').rotateX(0.01);
  car.getChild('rear_left').rotateX(0.01);
});

// left A
keyboard.createAction('a', function() {
  car.rotateLeft();
});

// right D
keyboard.createAction('d', function() {
  car.rotateRight();
});

keyboard.createAction('z', function() {
  car.translateY(100);
});

keyboard.createAction('x', function() {
  car.translateY(-100);
});

document.addEventListener('keydown', event => keyboard.onKeyDown(event.key), false);
document.addEventListener('keyup', event => keyboard.onKeyUp(event.key), false);

let listener = new Ticker(Client.ping);

let broadcaster = new Ticker(function() {
  let rotation = car.getRotation();
  Client.broadcast({
    entity_id: car.id,
    type: 'entity',
    action: 'rotate',
    x: rotation.x,
    y: rotation.y,
    z: rotation.z
  });
  let position = car.getPosition();
  Client.broadcast({
    entity_id: car.id,
    type: 'entity',
    action: 'translate',
    x: position.x,
    y: position.y,
    z: position.z
  });
});

// add canvas to page
document.getElementById('view').appendChild(camera1.getElement());

// 30 frames per second
const frameRate = 30;

(function animate(){
  setTimeout(function() {
    // render world on canvase
    camera1.render(world);

    // update all object positions
    world.getAllObjects()
      .filter(object => {
        if (object instanceof LevelGroundPlayer && object.id !== car.id) {
          return true;
        }
      })
      .forEach(object => {
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