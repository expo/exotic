import * as CANNON from 'cannon';
import ExpoTHREE, { THREE } from 'expo-three';

class World extends CANNON.World {
  loaded = false;
  broadphase = new CANNON.NaiveBroadphase();
  fixedTimeStep = 1 / 60;
  maxSubSteps = 3;

  loadAsync = async () => {
    this.solver.iterations = 10;
    this.loaded = true;
  };

  update = (delta, time) => {
    if (!this.loaded) {
      return false;
    }
    this.step(this.fixedTimeStep, delta, this.maxSubSteps);
  };
}

export default World;
