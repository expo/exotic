import Expo from 'expo';
import React from 'react';
import { View } from 'react-native';

import Assets from './Assets';
import Settings from './constants/Settings';
import GameScreen from './screens/GameScreen';
import AssetUtils from 'expo-asset-utils';
import Assets from './Assets';
class App extends React.Component {
  state = {
    images: {},
    loading: true,
  };

  get fonts() {
    let items = {};
    const keys = Object.keys(Assets.fonts || {});
    for (let key of keys) {
      const item = Assets.fonts[key];
      const name = key.substr(0, key.lastIndexOf('.'));
      items[name] = item;
    }
    return [items];
  }

  get files() {
    return [
      ...AssetUtils.arrayFromObject(Assets.images || {}),
      ...AssetUtils.arrayFromObject(Assets.models || {}),
    ];
  }

  get audio() {
    return AssetUtils.arrayFromObject(Assets.audio);
  }

  async preloadAssets() {
    await AssetUtils.cacheAssetsAsync({
      fonts: this.fonts,
      files: this.files,
      audio: this.audio,
    });
    this.setState({ loading: false });
  }

  componentWillMount() {
    this.preloadAssets();
  }

  get loadingScreen() {
    if (Settings.debug) {
      return <View />;
    } else {
      return <Expo.AppLoading />;
    }
  }

  get screen() {
    return <GameScreen />;
  }

  render() {
    return this.state.loading ? this.loadingScreen : this.screen;
  }
}

export default App;
