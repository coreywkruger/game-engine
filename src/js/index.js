import uuid from "uuid";
import * as game from "./gameengine";
import { CreateCar } from "./helpers.js";
import WebRTCClient from "./webrtc-js";

const client = new WebRTCClient();

client.start(`${process.env.PEER_SERVICE}/register?id=${client.id}`);

client.onmessage = function (id, data) {
  const message = JSON.parse(data);
  const object = world.getObject(message.id);
  if (object) {
    object.setPositionInterpolation(message.tx, message.ty, message.tz, 10);
    object.setRotationInterpolation(message.rx, message.ry, message.rz, 10);
  }
};

console.log('\n+++', client.id)
client.onconnect = function (client_id) {
  console.log('\n==', client_id)
  world.add(CreateCar(client_id));
};

client.onclose = function (client_id) {
  world.deleteObject(client_id);
};

// create camera
const camera1 = new game.Camera("cam1", 35, 1000, 500);
camera1.setPosition(0, 12000, 50000);
camera1.rotateX(-Math.PI / 12);

// create car
const car = CreateCar(client.id);
// attach camera to car (chase cam)
car.add(camera1);

// create game world
const world = new game.World();
// add car to game world
world.add(car);

// create key bindings to control car (wasd)
const keyboard = new game.Controls();
keyboard.bindKey("w", function () {
  car.moveForward();
});
keyboard.bindKey("s", function () {
  car.moveBackward();
});
keyboard.bindKey("a", function () {
  car.rotateLeft();
});
keyboard.bindKey("d", function () {
  car.rotateRight();
});

// trigger keybindings
document.addEventListener("keydown", (event) => keyboard.onKeyDown(event.key));
document.addEventListener("keyup", (event) => keyboard.onKeyUp(event.key));
// add canvas to page
document.getElementById("view").appendChild(camera1.getCanvas());

function keepAlive() {
  client.ping();
}

function broadcastCoordinates() {
  const rotation = car.getRotation();
  const position = car.getPosition();
  client.broadcast({
    id: car.name,
    tx: position.x,
    ty: position.y,
    tz: position.z,
    rx: rotation.x,
    ry: rotation.y,
    rz: rotation.z,
  });
}

// 30 frames per second
const FRAME_RATE = 30;
const broadcastTimer = new game.Ticker(FRAME_RATE / 10);
const keepAliveTimer = new game.Ticker(FRAME_RATE);

(function animate() {
  setTimeout(function () {
    // render world on canvase
    camera1.render(world);
    // update all object positions
    world
      .getAllObjects()
      .filter((object) => {
        if (
          object instanceof game.LevelGroundPlayer &&
          object.name !== car.name
        )
          return true;
      })
      .forEach((object) => object.interpolateCoordinates());

    // broadcaster user coordinates
    broadcastTimer.tick(broadcastCoordinates);
    // listen for other users coordinates
    keepAliveTimer.tick(keepAlive);

    requestAnimationFrame(animate);
  }, 1000 / FRAME_RATE);
})();
