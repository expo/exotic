import GameObject from './GameObject';
class CollisionObject extends GameObject {
  static cubeIntersect = (a, b) => {
    const dist = a.position.clone().sub(b.position.clone());
    return dist.length() < (a._size.width + b._size.width) / 2;
  };
  hit = false;

  onCollide(id) {}

  reset() {
    super.reset();
    this.hit = false;
  }
}

export default CollisionObject;
