import GameObject from './GameObject';
class CollisionObject extends GameObject {
  static cubeIntersect = (a, b, axis = 'width') => {
    const dist = a.position.clone().sub(b.position.clone());
    return dist.length() < (a[axis] + b[axis]) / 2;
  };
  hit = false;

  onCollide(id) {}

  reset() {
    super.reset();
    this.hit = false;
  }
}

export default CollisionObject;
