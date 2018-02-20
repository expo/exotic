import World from './World';
import * as CANNON from 'cannon';
import CannonDebugRenderer from '../utils/CannonDebugRenderer';
import GameObject from './GameObject';

class Game extends GameObject {
  world = new World();
  scene = new THREE.Scene();
  level;
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
    this.level.update(delta, time);
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
    this.level.onTouchesBegan(event);
  };
  onTouchesMoved = event => {
    this.updateTouch({ x: event.locationX, y: event.locationY });
    this.level.onTouchesMoved(event);
  };
  onTouchesEnded = event => {
    this.updateTouch({ x: event.locationX, y: event.locationY });
    this.level.onTouchesEnded(event);
  };
  onTouchesCancelled = event => {
    this.updateTouch({ x: event.locationX, y: event.locationY });
    this.level.onTouchesCancelled(event);
  };
}

export default Game;
