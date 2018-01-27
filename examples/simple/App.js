import Expo from 'expo';
import React from 'react';
import { View } from 'react-native';

import Assets from './Assets';
import Settings from './constants/Settings';
import GameScreen from './screens/GameScreen';
import arrayFromObject from './utils/arrayFromObject';
import cacheAssetsAsync from './utils/cacheAssetsAsync';

class App extends React.Component {
  state = { loading: true };

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

  componentWillMount() {
    this._setupExperienceAsync();
  }

  _setupExperienceAsync = async () => {
    await Promise.all([this.preloadAsync()]);
    this.setState({ loading: false });
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
    return [...arrayFromObject(Assets.images || {}), ...arrayFromObject(Assets.models || {})];
  }

  async preloadAsync() {
    await cacheAssetsAsync({
      fonts: this.fonts,
      files: this.files,
    });
  }

  render() {
    return this.state.loading ? this.loadingScreen : this.screen;
  }
}

export default App;
