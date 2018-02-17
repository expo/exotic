import GameObject from './GameObject';
import * as CANNON from 'cannon';

class PhysicsObject extends GameObject {
  shape;
  body;

  async loadBody() {}

  update(delta, time) {
    super.update(delta, time);
    if (!this.loaded) {
      return false;
    }

    this.syncPhysicsBody();
  }

  syncPhysicsBody = () => {
    this.position.copy(this.body.position);
    this.quaternion.copy(this.body.quaternion);
  };
}

export default PhysicsObject;
