import Exotic from '@expo/exotic';
import * as CANNON from 'cannon';
import ExpoTHREE, { THREE } from 'expo-three';
import Assets from '../../Assets';
import { FileSystem } from 'expo';
import AssetUtils from 'expo-asset-utils';
class Hero extends Exotic.GameObject {
  /*
    This is called right after loadAsync.
    We use this time to setup the physics.
  */
  loadBody = () => {
    const chassisBody = new CANNON.Body({
      mass: 1,
      // material: new CANNON.Material(),
    });
    // body.position.set(0, 0, 0);

    const { size } = this;

    const centerOfMassAdjust = new CANNON.Vec3(0, 0, 0);
    const { x, y, z } = new THREE.Box3().setFromObject(this.car.frontLeftWheelMesh).getSize();

    chassisBody.addShape(
      new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2)),
      centerOfMassAdjust
    );
    // chassisBody.angularVelocity.set(0, 0.5, 0);
    chassisBody.position.set(0, 0, 0);

    const options = {
      radius: y / 2,
      directionLocal: new CANNON.Vec3(0, -1, 0), // The ray cast vector - which way is down
      // suspensionStiffness: 3,
      // suspensionRestLength: 0.1,
      // frictionSlip: 0.5,
      // dampingRelaxation: 2.3,
      // dampingCompression: 4.4,
      // maxSuspensionForce: 100,
      // rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(1, 0, 0), /// The axis the wheel pivots on
      chassisConnectionPointLocal: new CANNON.Vec3(0, 0, 0),
      // maxSuspensionTravel: 0.5,
      // customSlidingRotationalSpeed: -3.0,
      // useCustomSlidingRotationalSpeed: true,
    };

    // Create the vehicle
    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody,
    });

    // const material = new CANNON.Material('wheelMaterial');
    // this.wheelMaterial = material;

    const offset = { x: this.width * 0.45, y: -this.height * 0.24, z: this.depth * 0.32 };

    const frontInset = -this.depth * 0.05;
    options.chassisConnectionPointLocal.set(offset.x, offset.y, offset.z + frontInset);
    this.vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-offset.x, offset.y, offset.z + frontInset);
    this.vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(offset.x, offset.y, -offset.z);
    this.vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-offset.x, offset.y, -offset.z);
    this.vehicle.addWheel(options);

    this.wheelBodies = [];
    for (var i = 0; i < this.vehicle.wheelInfos.length; i++) {
      var wheel = this.vehicle.wheelInfos[i];
      var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
      var wheelBody = new CANNON.Body({
        mass: 0,
        // material,
      });
      wheelBody.type = CANNON.Body.KINEMATIC;
      wheelBody.collisionFilterGroup = 0; // turn off collisions
      var q = new CANNON.Quaternion();
      q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
      wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
      this.wheelBodies.push(wheelBody);
      this.game.world.addBody(wheelBody);
    }

    this.game.world.addEventListener('postStep', () => {
      for (var i = 0; i < this.vehicle.wheelInfos.length; i++) {
        this.vehicle.updateWheelTransform(i);
        var t = this.vehicle.wheelInfos[i].worldTransform;
        var wheelBody = this.wheelBodies[i];
        wheelBody.position.copy(t.position);
        wheelBody.quaternion.copy(t.quaternion);

        if (i == 0) {
          console.log(this.car.wheels[i].position, t.position);
        }
        this.car.wheels[i].position.copy(t.position);
        // this.car.wheels[i].quaternion.copy(this.vehicle.wheelInfos[i].body.quaternion);
      }
    });

    this.vehicle.addToWorld(this.game.world);
  };

  async loadAsync(scene) {
    const carName = 'gallardo';

    var m = [],
      s = CARS[carName].scale * 1,
      r = CARS[carName].init_rotation,
      materials = CARS[carName].materials,
      mi = CARS[carName].init_material,
      bm = CARS[carName].body_materials;
    for (var i in CARS[carName].mmap) {
      m[i] = CARS[carName].mmap[i];
    }

    // const mesh = new THREE.Mesh(geometry, m);

    for (var j = 0; j < bm.length; j++) {
      m[bm[0]] = materials.body[2][1];
    }

    const { parts: model } = Assets.models.gallardo;
    const car = new ExpoTHREE.Car();
    car.modelScale = 2;
    car.backWheelOffset = 45;

    const setMaterials = car => {
      // 0 - top, front center, back sides
      // 1 - front sides
      // 2 - engine
      // 3 - small chrome things
      // 4 - backlights
      // 5 - back signals
      // 6 - bottom, interior
      // 7 - windshield
      // BODY
      let materials = car.body.materials;
      materials[0] = mlib['Black metal']; // top, front center, back sides
      materials[1] = mlib['Chrome']; // front sides
      materials[2] = mlib['Chrome']; // engine
      materials[3] = mlib['Dark chrome']; // small chrome things
      materials[4] = mlib['Red glass']; // backlights
      materials[5] = mlib['Orange glass']; // back signals
      materials[6] = mlib['Black rough']; // bottom, interior
      materials[7] = mlib['Dark glass']; // windshield
      // WHEELS
      materials = car.wheel.materials;
      materials[0] = mlib['Chrome']; // insides
      materials[1] = mlib['Black rough']; // tire
    };

    const readJsonFromAsset = async asset => {
      const uri = await AssetUtils.uriAsync(asset);
      const strJson = await FileSystem.readAsStringAsync(uri);
      return JSON.parse(strJson);
    };

    const [body, wheels] = await new Promise.all([
      readJsonFromAsset(model['gallardo_body_bin.json']),
      readJsonFromAsset(model['gallardo_wheel_bin.json']),
    ]);

    await car.loadParts(body, wheels, name => model[name]);
    setMaterials(car);
    ExpoTHREE.utils.scaleLongestSideToSize(car.root, 3);
    // ExpoTHREE.utils.alignMesh(car.root);
    car.enableShadows(true);
    this.add(car.root);

    this.car = car;

    this.car.wheels = [
      this.car.frontLeftWheelRoot,
      this.car.frontRightWheelRoot,
      this.car.backLeftWheelMesh,
      this.car.backRightWheelMesh,
    ];
    this.game.camera.addActor({
      name: 'player',
      targetObject: this,
      cameraPosition: new THREE.Vector3(0, 6, 15),
      fixed: false,
      stiffness: 0.1,
      matchRotation: true,
    });

    // Now tell this camera to track the target we just created.
    this.game.camera.setActor('player');

    await super.loadAsync(scene);
    // await this.loadBody();
  }

  controls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  update(delta, time) {
    super.update(delta, time);
    // this.car.updateCarModel(delta, this.controls);

    // console.log(this.vehicle.chassisBody.quaternion);
    this.position.copy(this.vehicle.chassisBody.position);
    this.quaternion.copy(this.vehicle.chassisBody.quaternion);

    // for (let i = 0; i < this.wheelBodies.length; i++) {
    //   this.vehicle.updateWheelTransform(i);
    //   const t = this.wheelBodies[i];
    //   this.car.wheels[i].position.copy(t.position);
    //   this.car.wheels[i].quaternion.copy(t.quaternion);
    // }

    // this.position.set(this.vehicle.chassisBody.position);
    // this.quaternion.set(this.vehicle.chassisBody.quaternion);
  }

  /*
    This provides the PanResponder event.
  */
  onTouchesBegan = ({ locationX: x, locationY: y }) => {
    this.controls.forward = true;
    // this.controls.left = true;
    this.updateCarMovement(false);
  };

  onTouchesEnded = () => {
    // this.controls.forward = false;
    // this.controls.left = false;
    // this.controls.right = false;
    this.updateCarMovement(true);
  };

  updateCarMovement = up => {
    var maxSteerVal = 0.5; //Math.PI / 8;
    var maxForce = 10;
    var brakeForce = 1000000;

    this.vehicle.setBrake(0, 0);
    this.vehicle.setBrake(0, 1);
    this.vehicle.setBrake(0, 2);
    this.vehicle.setBrake(0, 3);

    if (this.controls.brake) {
      this.vehicle.setBrake(brakeForce, 0);
      this.vehicle.setBrake(brakeForce, 1);
      this.vehicle.setBrake(brakeForce, 2);
      this.vehicle.setBrake(brakeForce, 3);
    }

    if (this.controls.forward) {
      this.vehicle.applyEngineForce(up ? 0 : maxForce, 2);
      this.vehicle.applyEngineForce(up ? 0 : maxForce, 3);
    }

    if (this.controls.backward) {
      this.vehicle.applyEngineForce(up ? 0 : maxForce / 2, 2);
      this.vehicle.applyEngineForce(up ? 0 : maxForce / 2, 3);
    }
    if (this.controls.right) {
      this.vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
      this.vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
    }
    if (this.controls.left) {
      this.vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
      this.vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
    }
  };
}

export default Hero;

const mlib = {
  Orange: new THREE.MeshLambertMaterial({
    color: 0xff6600,
    // envMap: textureCube,
    combine: THREE.MixOperation,
    reflectivity: 0.3,
  }),
  Blue: new THREE.MeshLambertMaterial({
    color: 0x001133,
    // envMap: textureCube,
    combine: THREE.MixOperation,
    reflectivity: 0.3,
  }),
  Red: new THREE.MeshLambertMaterial({
    color: 0x660000,
    // envMap: textureCube,
    combine: THREE.MixOperation,
    reflectivity: 0.25,
  }),
  Black: new THREE.MeshLambertMaterial({
    color: 0x000000,
    // envMap: textureCube,
    combine: THREE.MixOperation,
    reflectivity: 0.15,
  }),
  White: new THREE.MeshLambertMaterial({
    color: 0xffffff,
    // envMap: textureCube,
    combine: THREE.MixOperation,
    reflectivity: 0.25,
  }),
  Carmine: new THREE.MeshPhongMaterial({
    color: 0x770000,
    specular: 0xffaaaa,
    // envMap: textureCube,
    combine: THREE.MultiplyOperation,
  }),
  Gold: new THREE.MeshPhongMaterial({
    color: 0xaa9944,
    specular: 0xbbaa99,
    shininess: 50,
    // envMap: textureCube,
    combine: THREE.MultiplyOperation,
  }),
  Bronze: new THREE.MeshPhongMaterial({
    color: 0x150505,
    specular: 0xee6600,
    shininess: 10,
    // envMap: textureCube,
    combine: THREE.MixOperation,
    reflectivity: 0.25,
  }),
  Chrome: new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    // envMap: textureCube,
    combine: THREE.MultiplyOperation,
  }),
  'Orange metal': new THREE.MeshLambertMaterial({
    color: 0xff6600,
    // envMap: textureCube,
    combine: THREE.MultiplyOperation,
  }),
  'Blue metal': new THREE.MeshLambertMaterial({
    color: 0x001133,
    // envMap: textureCube,
    combine: THREE.MultiplyOperation,
  }),
  'Red metal': new THREE.MeshLambertMaterial({
    color: 0x770000,
    // envMap: textureCube,
    combine: THREE.MultiplyOperation,
  }),
  'Green metal': new THREE.MeshLambertMaterial({
    color: 0x007711,
    // envMap: textureCube,
    combine: THREE.MultiplyOperation,
  }),
  'Black metal': new THREE.MeshLambertMaterial({
    color: 0x222222,
    // envMap: textureCube,
    combine: THREE.MultiplyOperation,
  }),
  'Pure chrome': new THREE.MeshLambertMaterial({
    color: 0xffffff,
    // envMap: textureCube,
  }),
  'Dark chrome': new THREE.MeshLambertMaterial({
    color: 0x444444,
    // envMap: textureCube,
  }),
  'Darker chrome': new THREE.MeshLambertMaterial({
    color: 0x222222,
    // envMap: textureCube,
  }),
  'Black glass': new THREE.MeshLambertMaterial({
    color: 0x101016,
    // envMap: textureCube,
    opacity: 0.975,
    transparent: true,
  }),
  'Dark glass': new THREE.MeshLambertMaterial({
    color: 0x101046,
    // envMap: textureCube,
    opacity: 0.25,
    transparent: true,
  }),
  'Blue glass': new THREE.MeshLambertMaterial({
    color: 0x668899,
    // envMap: textureCube,
    opacity: 0.75,
    transparent: true,
  }),
  'Light glass': new THREE.MeshBasicMaterial({
    color: 0x223344,
    // envMap: textureCube,
    opacity: 0.45,
    transparent: true,
    // combine: THREE.MixOperation,
    reflectivity: 0.25,
  }),
  'Red glass': new THREE.MeshLambertMaterial({
    color: 0xff0000,
    opacity: 0.75,
    transparent: true,
  }),
  'Yellow glass': new THREE.MeshLambertMaterial({
    color: 0xffffaa,
    opacity: 0.75,
    transparent: true,
  }),
  'Orange glass': new THREE.MeshLambertMaterial({
    color: 0x995500,
    opacity: 0.75,
    transparent: true,
  }),
  'Orange glass 50': new THREE.MeshLambertMaterial({
    color: 0xffbb00,
    opacity: 0.5,
    transparent: true,
  }),
  'Red glass 50': new THREE.MeshLambertMaterial({
    color: 0xff0000,
    opacity: 0.5,
    transparent: true,
  }),
  'Fullblack rough': new THREE.MeshLambertMaterial({ color: 0x000000 }),
  'Black rough': new THREE.MeshLambertMaterial({ color: 0x050505 }),
  'Darkgray rough': new THREE.MeshLambertMaterial({ color: 0x090909 }),
  'Red rough': new THREE.MeshLambertMaterial({ color: 0x330500 }),
  'Darkgray shiny': new THREE.MeshPhongMaterial({
    color: 0x000000,
    specular: 0x050505,
  }),
  'Gray shiny': new THREE.MeshPhongMaterial({
    color: 0x050505,
    shininess: 20,
  }),
};
// Gallardo materials

let CARS = {
  gallardo: {
    name: 'Lamborghini Gallardo',
    url: 'obj/gallardo/GallardoNoUv_bin.js',
    author:
      '<a href="http://artist-3d.com/free_3d_models/dnm/model_disp.php?uid=1711" target="_blank" rel="noopener">machman_3d</a>',
    init_rotation: [0, 0, 0],
    scale: 3.7,
    init_material: 9,
    body_materials: [3],
    object: null,
    buttons: null,
    materials: null,
  },
};
CARS['gallardo'].materials = {
  body: [
    ['Orange', mlib['Orange']],
    ['Blue', mlib['Blue']],
    ['Red', mlib['Red']],
    ['Black', mlib['Black']],
    ['White', mlib['White']],
    ['Orange metal', mlib['Orange metal']],
    ['Blue metal', mlib['Blue metal']],
    ['Green metal', mlib['Green metal']],
    ['Black metal', mlib['Black metal']],
    ['Carmine', mlib['Carmine']],
    ['Gold', mlib['Gold']],
    ['Bronze', mlib['Bronze']],
    ['Chrome', mlib['Chrome']],
  ],
};
m = CARS['gallardo'].materials;
mi = CARS['gallardo'].init_material;
CARS['gallardo'].mmap = {
  0: mlib['Pure chrome'], // wheels chrome
  1: mlib['Black rough'], // tire
  2: mlib['Light glass'], // windshield
  3: m.body[mi][1], // body
  4: mlib['Black glass'], // back lights ///Red glass
  5: mlib['Yellow glass'], // front lights
  6: mlib['Dark chrome'], // windshield rim
};
