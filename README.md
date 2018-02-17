[![NPM](https://nodei.co/npm/expo-exotic.png)](https://nodei.co/npm/expo-exotic/)

---

# [expo-exotic](https://snack.expo.io/@bacon/exotic)

A game engine for 3D Expo Games

### Installation

```bash
yarn add expo-exotic
```

### Usage

Import the library into your JavaScript file:

```js
import Exotic from 'expo-exotic';
```

# Components

## `Exotic.GameView`

A component that provides touches and a WebGL Context

#### Props

| Property                            |            Type             | Default  | Description                                                                                                         |
| ----------------------------------- | :-------------------------: | :------: | ------------------------------------------------------------------------------------------------------------------- |
| arEnabled                           |          ?boolean           |   null   | Enables an ARKit context: **iOS Only**                                                                              |
| update                              |   (delta: number) => void   |   null   | Called every frame with delta time since the last frame                                                             |
| onContextCreate                     | (gl, arSession?) => Promise |   null   | Called with the newly created GL context, and optional arSession                                                    |
| onShouldReloadContext               |        () => boolean        |   null   | A delegate function that requests permission to reload the GL context when the app returns to the foreground        |
| onResize                            |  (layout: Layout) => void   |   null   | Invoked when the view changes size, or the device orientation changes, returning the `{x, y, width, height, scale}` |
| shouldIgnoreSafeGaurds              |          ?boolean           |   null   | This prevents the app from stopping when run in a simulator, or when AR is run in devices that don't support AR     |
| onTouchesBegan                      |          Function           | () => {} | Invoked when a user touches the component                                                                           |
| onTouchesMoved                      |          Function           | () => {} | Invoked when a user moves their touch around the component                                                          |
| onTouchesEnded                      |          Function           | () => {} | Invoked when a user ends a touch on the component                                                                   |
| onTouchesCancelled                  |          Function           | () => {} | Invoked when a touche is cancelled in the component                                                                 |
| onStartShouldSetPanResponderCapture |        () => Boolean        | () => {} | used to determine if the component should capture touches on start                                                  |

## `Exotic.TouchableView`

A component that provides touches and broadcasts them to the window

#### Props

| Property                            |     Type      | Default  | Description                                                        |
| ----------------------------------- | :-----------: | :------: | ------------------------------------------------------------------ |
| onTouchesBegan                      |   Function    | () => {} | Invoked when a user touches the component                          |
| onTouchesMoved                      |   Function    | () => {} | Invoked when a user moves their touch around the component         |
| onTouchesEnded                      |   Function    | () => {} | Invoked when a user ends a touch on the component                  |
| onTouchesCancelled                  |   Function    | () => {} | Invoked when a touche is cancelled in the component                |
| onStartShouldSetPanResponderCapture | () => Boolean | () => {} | used to determine if the component should capture touches on start |

---

An Expo game has the following general structure

```
App/
├── screens/
│   └── GameScreen.js
├── Game/
│   ├── index.js
│   ├── nodes
│   │   ├── Hero.js
│   │   └── Ground.js
│   └── states
│       └── PlayingState.js
├── components/
│   └── Loading.js
├── constants/
│   ├── Colors.js
│   └── Settings.js
└── assets/
    ├── audio
    ├── fonts
    ├── icons
    ├── images
    └── models
```

### Extending a GameObject

Exotic objects are designed to be asynchronous. This allows us to manage loading state and download assets in a unified manner.
Each object also has an update loop that we should use to do things like movement and animation. When an object is added to another object, it's load method is invoked and it's update method is called recursively.

```js
class Node extends Exotic.GameObject {
  /* `GameObject`s have an async structure. The main entry point is `async loadAsync()`. */
  async loadAsync() {
    const { gem } = this;

    /* Add is async, when invoked with a GameObject, `add()` will call `loadAsync()` and append the child to the `GameObject`s objects:Array<GameObject> */
    await this.add(gem);
    return super.loadAsync(arguments);
  }

  /* Breaking out meshes into their own getter allows us to keep clean consise naming, otherwise things can get messy and hard to manage. */
  get gem() {
    /* We use this factory instance to share materials and cut down on memory cost */
    const material = Exotic.Factory.shared.materials.green;
    const mesh = new THREE.Mesh(this.gemGeometry, material);
    return mesh;
  }

  get gemGeometry() {
    const geometry = new THREE.CylinderGeometry(0.6, 1, 0.3, 6, 1);
    geometry.vertices[geometry.vertices.length - 1].y = -1;
    geometry.verticesNeedUpdate = true;
    return geometry;
  }

  /* When a `GameObject` is the child of the main `GameObject`, it's `update(delta, time)` function is called recursively */
  update(delta: number, time: number) {
    super.update(delta, time);
  }
}

export default Gem;
```

### Extending a physical object

By default Exotic uses `Cannon.js` physics as they are light weight.
Unfortunetly because `Ammo.js` is so large we cannot publish it to Expo 😭

> If we can't find a way to create more advanced shapes in `Cannon.js` we will try to implement `Ammo.js` instead.

Physics objects have a method called `syncPhysicsBody()` that is called in the `update()` function, this will match the nodes position and transform to the physics body.

```js
class Node extends Exotic.PhysicsObject {
  /*
          This is called right after loadAsync.
          We use this time to setup the physics.
        */
  loadBody = () => {
    this.body = new CANNON.Body({
      mass: 0.5,
      material: new CANNON.Material(),
    });
    this.body.addShape(new CANNON.Sphere(1));
  };

  /*
          I like to bubble out variables so you can always use the `geometry`, `material`, `mesh` variable names.
        */
  get ball() {
    const geometry = new THREE.SphereBufferGeometry(1, 20, 10);

    /*
                  Use a recycled material!
                */
    const material = Exotic.Factory.shared.materials.white;
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }
  async loadAsync(scene) {
    this.add(this.ball);
    return super.loadAsync(scene);
  }
}

export default Node;
```

### Exotic.Game

This is the base class for a Game,
