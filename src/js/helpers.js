import { Cylinder, Cube } from "./primitives.js";
import { LevelGroundPlayer } from './player.js';

function CreateCar(id) {
    let cab = new Cube(`car-cab-${id}`, 4500, 4500, 15000, 0x00ff00);
  
    var rear_left = new Cylinder("rear_left", 3000, 2000, 0x00ff00);
    rear_left.setPosition(-5000, -5000, 4000);
    rear_left.setRotationZ(Math.PI / 2);
  
    var rear_right = new Cylinder("rear_right", 3000, 2000, 0x00ff00);
    rear_right.setPosition(5000, -5000, 4000);
    rear_right.setRotationZ(Math.PI / 2);
  
    var front_left = new Cylinder("front_left", 3000, 2000, 0x00ff00);
    front_left.setPosition(-5000, -5000, -4000);
    front_left.setRotationZ(Math.PI / 2);
  
    var front_right = new Cylinder("front_right", 3000, 2000, 0x00ff00);
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

  export { CreateCar };