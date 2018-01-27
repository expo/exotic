import { GameView } from '@expo/exotic';
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Expo from 'expo';

import Game from './Game';
class App extends React.Component {
  state = {
    loading: true,
  };
  game = new Game();

  get loading() {
    if (this.state.loading) {
      return (
        <View style={styles.loading}>
          <Image style={styles.loadingImage} source={require('./assets/icons/loading_white.gif')} />
        </View>
      );
    }
  }

  render() {
    const { onContextCreate, ...game } = this.game;
    return (
      <View style={styles.container}>
        <GameView
          {...game}
          onContextCreate={async (context, arSession) => {
            await onContextCreate(context, arSession);
            this.setState({ loading: false });
          }}
        />
        {this.loading}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    minWidth: '25%',
    maxWidth: '25%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
});

export default App;
