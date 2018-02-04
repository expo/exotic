import EventEmitter from 'EventEmitter';
import Document from './DOM/Document';

import HTMLImageElement from './DOM/HTMLImageElement';
import HTMLCanvasElement from './DOM/HTMLCanvasElement';
import HTMLVideoElement from './DOM/HTMLVideoElement';

global.HTMLImageElement = global.Image = HTMLImageElement;
global.HTMLVideoElement = global.Video = HTMLVideoElement;
global.HTMLCanvasElement = global.Canvas = HTMLCanvasElement;

global.document = window.document = new Document();
window.performance = {
  now: () => ({
    bind: () => () => ({}),
  }),
};

function checkEmitter() {
  if (
    !window.emitter ||
    !(window.emitter.on || window.emitter.addEventListener)
  ) {
    window.emitter = new EventEmitter();
  }
}

window.addEventListener = (eventName, listener) => {
  checkEmitter();
  if (window.emitter.on) {
    window.emitter.on(eventName, listener);
  } else if (window.emitter.addEventListener) {
    window.emitter.addEventListener(eventName, listener);
  }
};

window.removeEventListener = (eventName, listener) => {
  checkEmitter();
  if (window.emitter.off) {
    window.emitter.off(eventName, listener);
  } else if (window.emitter.removeEventListener) {
    window.emitter.removeEventListener(eventName, listener);
  }
};

window.DOMParser = window.DOMParser || require('xmldom-qsa').DOMParser;

import { TextDecoder } from 'text-encoding';
global.TextDecoder = TextDecoder;

global.userAgent = global.navigator.userAgent = 'chrome';
global.navigator.platform = [];
///https://www.w3schools.com/js/js_window_location.asp
window.location = window.location || {
  href: '', //  window.location.href returns the href (URL) of the current page
  hostname: '', //window.location.hostname returns the domain name of the web host
  pathname: '', //window.location.pathname returns the path and filename of the current page
  protocol: 'https', //window.location.protocol returns the web protocol used (http: or https:)
  assign: null, //window.location.assign loads a new document
};
