import Exotic from '@expo/exotic';
import ExpoTHREE, { THREE } from 'expo-three';
import { PixelRatio } from 'react-native';

import PlayingState from './states/PlayingState';
import Colors from '../constants/Colors';

class Game extends Exotic.Game {
  onContextCreate = async context => {
    Exotic.Factory.shared.initMaterials(Colors);

    const { drawingBufferWidth: width, drawingBufferHeight: height } = context;
    const scale = PixelRatio.get();

    this.configureRenderer({ context, width, height, scale });
    this.scene.size = { width: width / scale, height: height / scale };

    /// Standard Camera
    this.camera = new Exotic.ChaseCamera(75, width / height, 0.01, 10000);
    await this.loadAsync(this.scene);
  };

  configureRenderer = ({ context, width, height, scale }) => {
    const fastDevice = true;
    // renderer
    this.renderer = ExpoTHREE.createRenderer({
      gl: context,
      precision: fastDevice ? 'highp' : 'mediump',
      antialias: fastDevice ? true : false,
      maxLights: fastDevice ? 4 : 2,
      stencil: false,
    });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width / scale, height / scale);
    this.renderer.setClearColor(0x000000);
  };

  onResize = ({ width, height, scale }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    this.scene.size = { width, height };
  };

  loadAsync = async scene => {
    this.state = new PlayingState(this);
    await this.state.loadAsync(this.scene);
    this.scene.add(this.state);
    return super.loadAsync(this.scene);
  };

  update = (delta, time) => {
    // this.camera.update();
    this.renderer.render(this.scene, this.camera);

    super.update(delta, time);
  };
}

export default Game;
