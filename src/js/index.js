import uuid from "uuid";
import * as game from "./gameengine";
import { CreateCar } from "./helpers.js";
import WebRTCClient from "./webrtc-js";

const id = uuid.v4();

const client = new WebRTCClient({
  host: `${process.env.PEER_SERVICE}/register?id=${id}`,
});

client.onmessage = function (id, data) {
  let message = JSON.parse(data);
  let object = world.getObject(message.id);
  if (object) {
    object.setPositionInterpolation(message.tx, message.ty, message.tz, 10);
    object.setRotationInterpolation(message.rx, message.ry, message.rz, 10);
  }
};

client.onconnect = function (client_id) {
  world.add(CreateCar(client_id));
};

client.onremove = function (client_id) {
  world.deleteObject(client_id);
};

let world = new game.World();
let car = CreateCar(client.id);
let camera1 = new game.Camera(
  "cam1",
  35,
  window.innerWidth / window.innerHeight
);

camera1.setPosition(0, 12000, 50000);
camera1.rotateX(-Math.PI / 12);
car.add(camera1);
world.add(car);

// keyboard
let keyboard = new game.Controls();
// forward
keyboard.bindKey("w", function () {
  car.moveForward();
});
// backward
keyboard.bindKey("s", function () {
  car.moveBackward();
});
// left
keyboard.bindKey("a", function () {
  car.rotateLeft();
});
// right
keyboard.bindKey("d", function () {
  car.rotateRight();
});

// add canvas to page
document.getElementById("view").appendChild(camera1.getCanvas());
document.addEventListener("keydown", (event) => keyboard.onKeyDown(event.key));
document.addEventListener("keyup", (event) => keyboard.onKeyUp(event.key));

function keepAlive() {
  client.ping();
}

function broadcastCoordinates() {
  const rotation = car.getRotation();
  const position = car.getPosition();

  client.broadcast({
    id: car.name,
    rx: rotation.x,
    ry: rotation.y,
    rz: rotation.z,
    tx: position.x,
    ty: position.y,
    tz: position.z,
  });
}

// 30 frames per second
const FRAME_RATE = 30;

const broadcastTimer = new game.Ticker(FRAME_RATE / 10);
const keepAliveTimer = new game.Ticker(FRAME_RATE * 5);

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
        ) {
          return true;
        }
      })
      .forEach((object) => object.interpolateCoordinates());

    // broadcaster user coordinates
    broadcastTimer.tick(broadcastCoordinates);
    // listen for other users coordinates
    keepAliveTimer.tick(keepAlive);

    requestAnimationFrame(animate);
  }, 1000 / FRAME_RATE);
})();
