import World from './World';
import CoreObject from './CoreObject';
// import Scene from './Scene';
import * as CANNON from 'cannon';
import CannonDebugRenderer from '../utils/CannonDebugRenderer';

class Game extends CoreObject {
  world = new World();
  scene = new THREE.Scene();
  state;
  debugPhysics = false;

  loadAsync() {
    this.cannonDebugRenderer = new CannonDebugRenderer(this.scene, this.world);
    this.world.loadAsync(arguments);
    return super.loadAsync(arguments);
  }
  update(delta, time) {
    super.update(delta, time);

    if (!this.loaded) {
      return false;
    }
    this.state.update(delta, time);
    this.world.update(delta, time);
    if (this.debugPhysics) {
      this.cannonDebugRenderer.update();
    }
  }

  onTouchesBegan = event => this.state.onTouchesBegan(event);

  onTouchesMoved = event => this.state.onTouchesMoved(event);
  onTouchesEnded = event => this.state.onTouchesEnded(event);
  onTouchesCancelled = event => this.state.onTouchesCancelled(event);
}

export default Game;
