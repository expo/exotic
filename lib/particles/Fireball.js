import Proton from 'three.proton.js';
import ExpoTHREE, { THREE } from 'expo-three';
import GameObject from '../core/GameObject';

class Fireball extends GameObject {
  proton = new Proton();

  async loadAsync() {
    const { camera, scene } = this.game;

    emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(new Proton.Span(10, 15), 0.1);
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.ImageTarget(image));
    emitter.addInitialize(
      new Proton.Position(
        new Proton.PointZone(canvas.width / 2, canvas.height / 2),
      ),
    );
    emitter.addInitialize(new Proton.Life(1, 1.5));
    emitter.addInitialize(
      new Proton.V(new Proton.Span(1, 2), new Proton.Span(0, 360), 'polar'),
    );
    emitter.addBehaviour(new Proton.Color('#C97024', '#290000'));
    emitter.addBehaviour(new Proton.Scale(0, Proton.getSpan(5, 10)));
    emitter.emit();
    this.proton.addEmitter(emitter);

    const renderer = new Proton.SpriteRender(scene);
    renderer.blendFunc('SRC_ALPHA', 'ONE');

    const sprite = await this.createSprite(require('./assets/snow.png'));
    emitter.addInitialize(new Proton.Body(sprite));
    emitter.emit();

    this.proton.addEmitter(emitter);
    this.proton.addRender(renderer);

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

export default Fireball;
