import Ground from '../nodes/Ground';
import Lighting from '../nodes/Lighting';
import Hero from '../nodes/Hero';

import Exotic from '@expo/exotic';

import * as CANNON from 'cannon';
import ExpoTHREE, { THREE } from 'expo-three';
import Gem from '../nodes/Gem';
import Train from '../nodes/Train';
import Assets from '../../Assets';
import Vehicle from '../nodes/Vehicle';
require('three/examples/js/controls/OrbitControls');

class PlayingState extends Exotic.State {
  raycaster = new THREE.Raycaster();

  /*
    We use loadAsync in a nested form because this helps the components know when to hide the loader.
  */
  loadAsync = async () => {
    await this.loadObjects();

    this.configureCamera();
    this.configureWorld();
    await this.configureScene();
    this.game.debugPhysics = true;

    new THREE.OrbitControls(this.game.camera);

    return await super.loadAsync();
  };

  configureScene = async () => {
    this.game.scene.background = await ExpoTHREE.loadCubeTextureAsync({
      assetForDirection: ({ direction }) => Assets.images.skybox[direction + '.jpg'],
    });
    this.game.scene.fog = new THREE.Fog(0xa03619, 100, 150);
  };

  configureCamera = () => {
    this.game.camera.position.set(5, 3, -10);
    this.game.camera.lookAt(0, 0, 0);
  };

  configureWorld = () => {
    this.game.world.gravity.set(0, -5, 0);
    this.game.world.defaultContactMaterial.contactEquationStiffness = 1e8;
    this.game.world.defaultContactMaterial.contactEquationRelaxation = 10;
    this.game.world.defaultContactMaterial.friction = 0;
  };

  loadObjects = async () => {
    /*
    When we add `GameObject`s to eachother, they call `loadAsync` so we initialize in a promise.
    */
    const types = [
      new Hero(),
      new Ground(),
      new Gem(),
      new Exotic.Particles.Snow(),
      new Train(),
      new Lighting(),
    ];
    const promises = types.map(type => this.add(type));
    const [hero, ground, gem, snow] = await Promise.all(promises);
    this.hero = hero;
    this.ground = ground;

    this.game.world.addContactMaterial(
      new CANNON.ContactMaterial(ground.body.material, hero.wheelMaterial, {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000,
      })
    );
    this.game.world.addContactMaterial(
      new CANNON.ContactMaterial(ground.body.material, gem.body.material, {
        friction: 0.0,
        restitution: 0.9,
      })
    );
  };

  runHitTest = () => {
    this.raycaster.setFromCamera(this.game.touch, this.game.camera);
    const intersects = this.raycaster.intersectObjects(this.ground.children);
    for (const intersect of intersects) {
      const { distance, face, faceIndex, object, point, uv } = intersect;

      this.hero.body.position.x = point.x;
      this.hero.body.position.z = point.z;
    }
  };
}

export default PlayingState;
