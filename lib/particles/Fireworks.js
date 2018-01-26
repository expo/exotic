import Proton from 'three.proton.js';
import ExpoTHREE, { THREE } from 'expo-three';
import GameObject from '../core/GameObject';
class Fireworks extends GameObject {
  proton = new Proton();

  async loadAsync() {
    const { camera, scene } = this.game;

    const height = 100;
    const width = 100;

    const emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(new Proton.Span(1, 3), 1);
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Radius(2, 4));
    emitter.addInitialize(
      new Proton.P(new Proton.LineZone(10, height, width - 10, height)),
    );
    emitter.addInitialize(new Proton.Life(1, 1.5));
    emitter.addInitialize(
      new Proton.V(new Proton.Span(4, 6), new Proton.Span(0, 0, true), 'polar'),
    );
    emitter.addBehaviour(new Proton.Gravity(1));
    emitter.addBehaviour(new Proton.Color('#ff0000', 'random'));
    emitter.emit();
    this.proton.addEmitter(emitter);

    ////NOTICE :you can only use two emitters do this effect.In this demo I use more emitters want to test the emtter's life
    emitter.addEventListener(Proton.PARTICLE_DEAD, function(particle) {
      if (Math.random() < 0.7) this.createFirstEmitter(particle);
      else this.createSecendEmitter(particle);
    });

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

  createFirstEmitter = particle => {
    const subemitter = new Proton.Emitter();
    subemitter.rate = new Proton.Rate(new Proton.Span(250, 300), 1);
    subemitter.addInitialize(new Proton.Mass(1));
    subemitter.addInitialize(new Proton.Radius(1, 2));
    subemitter.addInitialize(new Proton.Life(1, 3));
    subemitter.addInitialize(
      new Proton.V(new Proton.Span(2, 4), new Proton.Span(0, 360), 'polar'),
    );
    subemitter.addBehaviour(new Proton.RandomDrift(10, 10, 0.05));
    subemitter.addBehaviour(new Proton.Alpha(1, 0));
    subemitter.addBehaviour(new Proton.Gravity(3));
    const color =
      Math.random() > 0.3 ? Proton.MathUtils.randomColor() : 'random';
    subemitter.addBehaviour(new Proton.Color(color));
    subemitter.p.x = particle.p.x;
    subemitter.p.y = particle.p.y;
    subemitter.emit('once', true);
    this.proton.addEmitter(subemitter);
  };

  createSecendEmitter = particle => {
    const subemitter = new Proton.Emitter();
    subemitter.rate = new Proton.Rate(new Proton.Span(100, 120), 1);
    subemitter.addInitialize(new Proton.Mass(1));
    subemitter.addInitialize(new Proton.Radius(4, 8));
    subemitter.addInitialize(new Proton.Life(1, 2));
    subemitter.addInitialize(
      new Proton.V([1, 2], new Proton.Span(0, 360), 'polar'),
    );
    subemitter.addBehaviour(new Proton.Alpha(1, 0));
    subemitter.addBehaviour(new Proton.Scale(1, 0.1));
    subemitter.addBehaviour(new Proton.Gravity(1));
    const color = Proton.MathUtils.randomColor();
    subemitter.addBehaviour(new Proton.Color(color));
    subemitter.p.x = particle.p.x;
    subemitter.p.y = particle.p.y;
    subemitter.emit('once', true);
    this.proton.addEmitter(subemitter);
  };

  update(delta, time) {
    super.update(delta, time);

    this.proton.update();
  }
}

export default Fireworks;
