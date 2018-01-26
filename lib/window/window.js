import EventEmitter from 'EventEmitter';
import Document from './DOM/Document';

global.document = window.document = new Document();
window.performance = {
  now: () => ({
    bind: () => () => ({}),
  }),
};

function checkEmitter() {
  if (!window.emitter || !window.emitter.on || !window.emitter.off) {
    window.emitter = new EventEmitter();
  }
}

window.addEventListener = (eventName, listener) => {
  checkEmitter();
  window.emitter.on(eventName, listener);
};

window.removeEventListener = (eventName, listener) => {
  checkEmitter();
  window.emitter.off(eventName, listener);
};
