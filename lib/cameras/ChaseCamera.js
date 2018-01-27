import { THREE } from 'expo-three';

class Actor {
  name = null;
  actorObject = new THREE.Object3D();
  cameraPosition = new THREE.Vector3(0, 30, 50);
  cameraRotation;
  fixed = false;
  stiffness = 0.4;
  matchRotation = true;
}

class ChaseCamera extends THREE.PerspectiveCamera {
  actors = {};
  actorOrder = [];
  currentActorName;
  idealObject = new THREE.Object3D();
  isTransitioning = false;

  translateIdealObject = vec => {
    const obj = this.idealObject;

    if (vec.x !== 0) {
      obj.translateX(vec.x);
    }

    if (vec.y !== 0) {
      obj.translateY(vec.y);
    }

    if (vec.z !== 0) {
      obj.translateZ(vec.z);
    }
  };

  determineCameraRotation = rotation => {
    if (rotation instanceof THREE.Euler) {
      return new THREE.Quaternion().setFromEuler(rotation);
    } else if (rotation instanceof THREE.Quaternion) {
      return rotation;
    }
  };

  addActor = settings => {
    const actor = new Actor();

    if (typeof settings === 'object') {
      for (const key in settings) {
        if (actor.hasOwnProperty(key)) {
          if (key === 'cameraRotation') {
            actor[key] = this.determineCameraRotation(settings[key]);
          } else {
            actor[key] = settings[key];
          }
        }
      }
    }

    this.actors[settings.name] = actor;
    this.actorOrder.push(settings.name);
  };

  setActor = name => {
    if (this.actors.hasOwnProperty(name)) {
      this.currentActorName = name;
    } else {
      console.warn('THREE.ChaseCamera.setActor: No actor with name ' + name);
    }
  };

  removeActor = (name, replacementName) => {
    const { actors, actorOrder } = this;

    // If there's only one actor, then make sure it's not removed
    // otherwise the world might end. And that is never fun.
    if (actorOrder.length === 1) {
      console.warn('THREE.ChaseCamera: Will not remove only existing camera actor.');
      return;
    }

    // If there's a actor with the given name, make sure it's
    // removed from both the actorOrder array and the
    // main actors object.
    if (actors.hasOwnProperty(name)) {
      actorOrder.splice(actorOrder.indexOf(name), 1);
      actors[name] = null;
    }

    // If a replacement actor is given, and it exists in the actor
    // store, then jump to that actor
    if (replacementName && actors.hasOwnProperty(replacementName)) {
      this.setActor(replacementName);
    } else {
      // Otherwise, jump to the last actor in the actorOrder array.
      this.setActor(actorOrder[actorOrder.length - 1]);
    }
  };

  update = () => {
    const actor = this.actors[this.currentActorName];
    if (!actor) return;

    const ideal = this.idealObject;

    if (!actor.fixed) {
      ideal.position.copy(actor.actorObject.position);
      ideal.quaternion.copy(actor.actorObject.quaternion);

      if (actor.cameraRotation !== undefined) {
        ideal.quaternion.multiply(actor.cameraRotation);
      }

      this.translateIdealObject(actor.cameraPosition);
      this.position.lerp(ideal.position, actor.stiffness);

      if (actor.matchRotation) {
        this.quaternion.slerp(ideal.quaternion, actor.stiffness);
      } else {
        this.lookAt(actor.actorObject.position);
      }
    } else {
      this.position.copy(actor.cameraPosition);
      this.lookAt(actor.actorObject.position);
    }
  };
}

export default ChaseCamera;
