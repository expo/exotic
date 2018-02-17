import { THREE } from 'expo-three';
class GameObject extends THREE.Object3D {
  _loaded = false;
  objects = [];
  active = true;
  alive = true;
  exists = true;
  velocity = new THREE.Vector3();
  angularVelocity = 0;
  outOfBoundsKill = false;
  _tint = null;
  forwardAxis = 'z';

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

  get position() {
    return this.position;
  }

  set position(value) {
    this.position.set(value);
  }

  get x() {
    return this.position.x;
  }
  set x(value) {
    this.position.x = value;
  }
  get y() {
    return this.position.y;
  }
  set y(value) {
    this.position.y = value;
  }
  get z() {
    return this.position.z;
  }
  set z(value) {
    this.position.z = value;
  }

  get loaded() {
    return this._loaded;
  }
  set loaded(value) {
    this._loaded = value;
  }

  get game() {
    return this._game;
  }
  set game(value) {
    this._game = value;
    this.setAll('game', value);
  }

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

  get countDead() {
    let dead = 0;
    for (let object of this.objects) {
      if (!object.alive) {
        dead += 1;
      }
    }
    return dead;
  }

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

  get angle() {
    return this.rotation[this.forwardAxis];
  }
  set angle(value) {
    this.rotation[this.forwardAxis] = value;
  }

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

  constructor(game) {
    super();
    this._game = game;
  }

  getFirstExists = exists => {
    for (let object of this.objects) {
      if (object.exists === exists) {
        return object;
      }
    }
    return this.objects[0];
  };

  setAll = (key, value) => {
    for (let object of this.objects) {
      object[key] = value;
    }
  };

  forEachAlive = callback => this.livingChildren.forEach(callback);

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

  kill = () => {
    this.alive = false;
    this.exists = false;
    this.visible = false;
    let promises = this.objects.map(object => object.kill());
    return Promise.all(promises);
  };

  isInFrustum = camera => {
    camera.updateMatrix();
    camera.updateMatrixWorld();
    const frustum = new THREE.Frustum();
    frustum.setFromMatrix(
      new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse,
      ),
    );

    return (
      this.frustumCulled === false || frustum.intersectsObject(this) === true
    );
  };

  destroy = () => {
    if (this.parent) {
      if (this.parent instanceof GameObject) {
        this.parent.destroyChild(this);
      } else {
        this.parent.remove(this);
        this.geometry && this.geometry.dipsose();
        this.material && this.material.dispose();
      }
    }
  };

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

  update(delta, time) {
    if (!this.loaded) {
      return false;
    }
    for (let object of this.objects) {
      object.update(delta, time);
    }

    if (this.outOfBoundsKill) {
      if (this.isInFrustum(this.game.camera)) {
        this.kill();
      }
    }
  }

  onTouchesBegan(event) {
    if (event.cascades === false) {
      return;
    }
    for (let object of this.objects) {
      object.onTouchesBegan(event);
    }
  }
  onTouchesMoved(event) {
    if (event.cascades === false) {
      return;
    }
    for (let object of this.objects) {
      object.onTouchesMoved(event);
    }
  }
  onTouchesEnded(event) {
    if (event.cascades === false) {
      return;
    }
    for (let object of this.objects) {
      object.onTouchesEnded(event);
    }
  }
  onTouchesCancelled(event) {
    if (event.cascades === false) {
      return;
    }
    for (let object of this.objects) {
      object.onTouchesCancelled(event);
    }
  }
}

export default GameObject;
