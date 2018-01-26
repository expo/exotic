import Proton from 'three.proton.js';
import ExpoTHREE, { THREE } from 'expo-three';
import GameObject from '../core/GameObject';
class Snow extends GameObject {
  proton = new Proton();

  async loadAsync() {
    const { camera, scene, renderer } = this.game;

    const emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(
      new Proton.Span(34, 48),
      new Proton.Span(0.2, 0.5),
    );
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Radius(new Proton.Span(10, 20)));
    const position = new Proton.Position();
    position.addZone(new Proton.BoxZone(2500, 10, 2500));
    emitter.addInitialize(position);
    emitter.addInitialize(new Proton.Life(5, 10));

    const sprite = await this.createSprite(require('./assets/snow.png'));
    emitter.addInitialize(new Proton.Body(sprite));
    emitter.addInitialize(
      new Proton.Velocity(0, new Proton.Vector3D(0, -1, 0), 90),
    );
    emitter.addBehaviour(new Proton.RandomDrift(10, 1, 10, 0.05));
    emitter.addBehaviour(new Proton.Rotate('random', 'random'));
    emitter.addBehaviour(new Proton.Gravity(2));
    const sceenZone = new Proton.ScreenZone(camera, renderer, 20, '234');
    emitter.addBehaviour(new Proton.CrossZone(sceenZone, 'dead'));
    emitter.p.x = 0;
    emitter.p.y = 800;
    emitter.emit();
    this.proton.addEmitter(emitter);
    this.proton.addRender(new Proton.SpriteRender(scene));

    this.emitter = emitter;
    return super.loadAsync(arguments);
  }

  createSprite = async resource => {
    const map = await ExpoTHREE.loadAsync(resource);
    const material = new THREE.SpriteMaterial({
      map: map,
      transparent: true,
      opacity: 0.5,
      color: 0xffffff,
    });
    this.sprite = new THREE.Sprite(material);
    return this.sprite;
  };

  update(delta, time) {
    super.update(delta, time);

    this.proton.update();
  }
}

export default Snow;
