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
  touch = new THREE.Vector2();

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

  updateTouch = ({ x, y }) => {
    const { width, height } = this.scene.size;
    this.touch.x = x / width * 2 - 1;
    this.touch.y = -(y / height) * 2 + 1;
  };

  onTouchesBegan = event => {
    this.updateTouch({ x: event.locationX, y: event.locationY });
    this.state.onTouchesBegan(event);
  };
  onTouchesMoved = event => {
    this.updateTouch({ x: event.locationX, y: event.locationY });
    this.state.onTouchesMoved(event);
  };
  onTouchesEnded = event => {
    this.updateTouch({ x: event.locationX, y: event.locationY });
    this.state.onTouchesEnded(event);
  };
  onTouchesCancelled = event => {
    this.updateTouch({ x: event.locationX, y: event.locationY });
    this.state.onTouchesCancelled(event);
  };
}

export default Game;
