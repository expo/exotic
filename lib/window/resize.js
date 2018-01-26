import { Dimensions, PixelRatio } from 'react-native';
const { width, height } = Dimensions.get('window');
/*
 Window Resize Stub
*/
window.devicePixelRatio = PixelRatio.get();
window.innerWidth = window.clientWidth = width;
window.innerHeight = window.clientHeight = height;

Dimensions.addEventListener(
  'change',
  ({ screen: { width, height, scale } }) => {
    window.devicePixelRatio = scale;
    window.innerWidth = window.clientWidth = width;
    window.innerHeight = window.clientHeight = height;
    window.emitter.emit('resize');
  },
);
