import Ground from '../nodes/Ground';
import Lighting from '../nodes/Lighting';
import Hero from '../nodes/Hero';

import Exotic from '@expo/exotic';

import * as CANNON from 'cannon';
import { THREE } from 'expo-three';
import Gem from '../nodes/Gem';

require('three/examples/js/controls/OrbitControls');

class PlayingState extends Exotic.State {
  name = 'playing';
  raycaster = new THREE.Raycaster();

  /*
    We use loadAsync in a nested form because this helps the components know when to hide the loader.
  */
  loadAsync = async () => {
    await this.loadObjects();

    this.configureCamera();
    this.configureWorld();
    this.configureScene();
    this.game.debugPhysics = false;

    new THREE.OrbitControls(this.game.camera);

    return await super.loadAsync();
  };

  configureScene = () => {
    this.game.scene.add(
      new THREE.Mesh(
        new THREE.CubeGeometry(1000, 1000, 1000),
        new THREE.MeshBasicMaterial({
          color: 0x434955,
          side: THREE.BackSide,
        })
      )
    );
    // this.game.scene.fog = new THREE.Fog(0x434955, 50, 100);
  };

  configureCamera = () => {
    this.game.camera.position.set(5, 3, -10);
    this.game.camera.lookAt(0, 0, 0);
  };

  configureWorld = () => {
    this.game.world.gravity.set(0, -5, 0);
    this.game.world.defaultContactMaterial.contactEquationStiffness = 1e8;
    this.game.world.defaultContactMaterial.contactEquationRelaxation = 10;
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
      new Lighting(),
    ];
    const promises = types.map(type => this.add(type));
    const [hero, ground, gem, snow] = await Promise.all(promises);
    this.hero = hero;
    this.ground = ground;

    this.game.world.addContactMaterial(
      new CANNON.ContactMaterial(ground.body.material, hero.body.material, {
        friction: 0.0,
        restitution: 0.5,
      })
    );
    this.game.world.addContactMaterial(
      new CANNON.ContactMaterial(ground.body.material, gem.body.material, {
        friction: 0.0,
        restitution: 0.9,
      })
    );
  };

  /*
    This provides the PanResponder event.
  */
  onTouchesBegan = ({ locationX: x, locationY: y }) => {
    this.hero.body.position.set(0, 0, 0);
    this.hero.body.velocity.set(0, 0, 0);

    this.runHitTest();
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
