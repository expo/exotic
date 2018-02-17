import Expo from 'expo';
import AssetUtils from 'expo-asset-utils';
import React from 'react';
import { View } from 'react-native';

import Assets from './Assets';
import Settings from './constants/Settings';
import GameScreen from './screens/GameScreen';

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
    try {
      await AssetUtils.cacheAssetsAsync({
        fonts: this.fonts,
        files: this.files,
        audio: this.audio,
      });
    } catch (e) {
      console.warn('There was an error caching assets:', e.message); // eslint-disable-line no-console
    } finally {
      this.setState({ loading: false });
    }
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
