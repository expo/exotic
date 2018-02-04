import Node from './Node';
import EventEmitter from 'EventEmitter';

class Element extends Node {
  style = {};
  emitter = new EventEmitter();
  constructor(tagName) {
    return super(tagName.toUpperCase());
  }

  get tagName() {
    return this.nodeName;
  }

  addEventListener(eventName, listener) {
    if (this.emitter.on) {
      this.emitter.on(eventName, listener);
    } else if (this.emitter.addEventListener) {
      this.emitter.addEventListener(eventName, listener);
    }
  }

  removeEventListener(eventName, listener) {
    if (this.emitter.off) {
      this.emitter.off(eventName, listener);
    } else if (this.emitter.removeEventListener) {
      this.emitter.removeEventListener(eventName, listener);
    }
  }

  setAttributeNS() {}

  createElementNS(tagName) {
    const canvas = this.createElement(tagName);
    canvas.getContext = () => ({
      fillRect: () => ({}),
      drawImage: () => ({}),
      getImageData: () => ({}),
      getContextAttributes: () => ({
        stencil: true,
      }),
      getExtension: () => ({
        loseContext: () => ({}),
      }),
    });
    canvas.toDataURL = () => ({});
    canvas.getBoundingClientRect = () => ({});

    return canvas;
  }

  get clientWidth() {
    return this.innerWidth;
  }
  get clientHeight() {
    return this.innerHeight;
  }

  get innerWidth() {
    return window.innerWidth;
  }
  get innerHeight() {
    return window.innerHeight;
  }

  getContext(contextType) {
    return {
      fillRect: _ => {},
      drawImage: _ => {},
      getImageData: _ => {},
      getContextAttributes: _ => ({
        stencil: true,
      }),
      getExtension: _ => ({
        loseContext: _ => {},
      }),
    };
  }
}

export default Element;
