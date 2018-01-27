import { THREE } from 'expo-three';
// import Factory from '../Factory';

class GameObject extends THREE.Object3D {
  _loaded = false;
  _size = { x: null, y: null, z: null };
  objects = [];
  active = true;
  constructor(game) {
    super();
    this._game = game;
  }

  tryAABB = box =>
    this.x < box.x + box.width &&
    this.x + this.width > box.x &&
    this.z < box.z + box.depth &&
    this.depth + this.z > box.z;

  get size() {
    const { x, y, z } = new THREE.Box3().setFromObject(this).getSize();
    this._size = { x, y, z };
    return this._size;
  }

  get width() {
    return this._size.x;
  }
  get height() {
    return this._size.y;
  }
  get depth() {
    return this._size.z;
  }

  set loaded(value) {
    this._loaded = value;
    this._size = this.size; /// Ugh
  }
  get loaded() {
    return this._loaded;
  }

  get game() {
    return this._game;
  }
  set game(value) {
    this._game = value;
    this.setAll('game', value);
  }

  // _alpha = 1;
  // get alpha() {
  //   return this._alpha;
  // }
  // set alpha(value) {
  //   this._alpha = value;
  //   const transparent = value !== 1;
  //   if (this.materials) {
  //     this.materials.map(material => {
  //       material.transparent = transparent;
  //       material.opacity = value;
  //     });
  //   } else if (this.material) {
  //     this.material.transparent = transparent;
  //     this.material.opacity = value;
  //   }

  //   this.setAll('alpha', value);

  //   this.traverse(function(child) {
  //     if (child instanceof THREE.Mesh) {
  //       if (child.materials) {
  //         child.materials.map(material => {
  //           material.transparent = transparent;
  //           material.opacity = value;
  //         });
  //       } else if (child.material) {
  //         child.material.transparent = transparent;
  //         child.material.opacity = value;
  //       }
  //     }
  //   });
  // }

  getFirstExists = exists => {
    for (let object of this.objects) {
      if (object.exists === exists) {
        return object;
      }
    }
    return this.objects[0];
  };

  get countDead() {
    let dead = 0;
    for (let object of this.objects) {
      if (!object.alive) {
        dead += 1;
      }
    }
    return dead;
  }

  _tint = null;
  get tint() {
    return this._tint;
  }
  set tint(value) {
    this._tint = value;
    if (this.materials) {
      this.materials.map(material => {
        material.color = value;
      });
    } else if (this.material) {
      this.material.color = value;
    }

    this.setAll('tint', value);

    this.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        if (child.materials) {
          child.materials.map(material => {
            material.color = value;
          });
        } else if (child.material) {
          child.material.color = value;
        }
      }
    });
  }

  set angle(value) {
    this.rotation.z = value;
  }

  setAll = (key, value) => {
    for (let object of this.objects) {
      object[key] = value;
    }
  };

  get livingChildren() {
    const children = [];
    for (let object of this.objects) {
      if (object.alive) {
        // callback(object);
        children.push(object);
      }
    }
    return children;
  }
  forEachAlive = callback => {
    for (let object of this.livingChildren) {
      callback(object);
    }
  };

  reset() {
    this.alive = true;
    this.exists = true;
    this.visible = true;

    let promises = this.objects.map(object => object.reset());
    return Promise.all(promises);
  }

  async loadAsync() {
    this.loaded = true;
  }

  get position() {
    return this.position;
  }

  set position(value) {
    this.position.set(value);
  }

  get x() {
    return this.position.x;
  }
  get y() {
    return this.position.y;
  }
  get z() {
    return this.position.z;
  }
  set x(value) {
    this.position.x = value;
  }
  set y(value) {
    this.position.y = value;
  }
  set z(value) {
    this.position.z = value;
  }

  alive = true;
  exists = true;
  kill = () => {
    this.alive = false;
    this.exists = false;
    this.visible = false;
    let promises = this.objects.map(object => object.kill());
    return Promise.all(promises);
  };

  isInFrustum = camera => {
    const box = {
      x: -this.game._width / 2,
      z: -this.game._height / 2,
      width: this.game._width,
      depth: this.game._height,
    };
    // console.log(this.size); ///this.x, box.x + box.width, this.x + this._size.width, box.x);
    return !this.tryAABB(box);

    // if (camera._frustum) {
    //   return camera._frustum.containsPoint(this.position);
    // } else {
    //   camera.updateMatrix();
    //   camera.updateMatrixWorld();
    //   const frustum = new THREE.Frustum();
    //   frustum.setFromMatrix(
    //     new THREE.Matrix4().multiplyMatrices(
    //       camera.projectionMatrix,
    //       camera.matrixWorldInverse,
    //     ),
    //   );
    //   camera._frustum = frustum;
    //   return this.isInFrustum(camera);
    // }
  };

  destroy = () => {
    if (this.parent) {
      if (this.parent instanceof GameObject) {
        this.parent.destroyChild(this);
      } else {
        this.parent.remove(this);
      }
    }
  };

  get objectLineage() {
    let children = [];
    for (let object of this.objects) {
      children = children.concat(object.objectLineage);
    }
    return children;
  }

  get meshLineage() {
    let children = [];
    for (let object of this.objectLineage) {
      if (object) children = children.concat(object.children);
    }
    return children;
  }

  destroyChild = object => {
    if (object instanceof GameObject) {
      const index = this.objects.indexOf(object);
      if (index > -1) {
        this.objects.splice(index, 1);
      }
      this.remove(object);
    } else if (object instanceof THREE.Object3D) {
      this.remove(object);
    }
  };
  velocity = new THREE.Vector3();

  async add(object) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i++) {
        await this.add(arguments[i]);
      }
      return this;
    }
    if (object === this) {
      console.error(
        "GameObject.add: object can't be added as a child of itself.",
        object,
      );
      return this;
    }
    if (object && object.isObject3D) {
      if (object.parent !== null) {
        object.parent.remove(object);
      }
      object.parent = this;
      object.dispatchEvent({ type: 'added' });

      this.children.push(object);

      if (object instanceof GameObject) {
        object.game = this.game;
        await object.loadAsync(this);
        object.loadBody && (await object.loadBody(this));
        object.body && this.game.world.add(object.body);
        this.objects.push(object);

        return object;
      }
    } else {
      console.error(
        'GameObject.add: object not an instance of THREE.Object3D.',
        object,
      );
    }

    return this;
  }

  remove = object => {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.remove(arguments[i]);
      }
      return this;
    }

    const index = this.children.indexOf(object);
    if (index !== -1) {
      object.parent = null;
      object.dispatchEvent({ type: 'removed' });
      this.children.splice(index, 1);
    }

    const objectIndex = this.objects.indexOf(object);
    if (objectIndex !== -1) {
      object.parent = null;
      // object.dispatchEvent( { type: 'removed' } );
      this.objects.splice(objectIndex, 1);
    }

    return this;
  };

  get box() {
    return new THREE.Box3().setFromObject(this);
  }
  get min() {
    return this.box.min;
  }
  get max() {
    return this.box.min;
  }
  get size() {
    return this.box.getSize();
  }
  get width() {
    return this.size.x;
  }
  get height() {
    return this.size.y;
  }
  get depth() {
    return this.size.z;
  }

  get center() {
    return this.box.center;
  }
  angularVelocity = 0;
  outOfBoundsKill = false;
  update(delta, time) {
    if (!this.loaded) {
      return false;
    }
    for (let object of this.objects) {
      object.update(delta, time);
    }

    this.updatePhysics(delta, time);
  }

  updatePhysics(delta, time) {
    if (this.outOfBoundsKill) {
      if (this.isInFrustum()) {
        this.kill();
      }
    }
    // const { velocity, angularVelocity } = this;
    // this.x += velocity.x * delta;
    // this.y += velocity.y * delta;
    // this.z += velocity.z * delta;

    // this.rotation.y += angularVelocity * delta;
  }

  onTouchesBegan(event) {
    for (let object of this.objects) {
      object.onTouchesBegan(event);
    }
  }
  onTouchesMoved(event) {
    for (let object of this.objects) {
      object.onTouchesMoved(event);
    }
  }
  onTouchesEnded(event) {
    for (let object of this.objects) {
      object.onTouchesEnded(event);
    }
  }
  onTouchesCancelled(event) {
    for (let object of this.objects) {
      object.onTouchesCancelled(event);
    }
  }
}

export default GameObject;
