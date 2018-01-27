import { GameView } from '@expo/exotic';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import Loading from '../components/Loading';
import Game from '../Game';

class GameScreen extends React.Component {
  state = {
    loading: true,
  };
  game = new Game();

  get loading() {
    if (this.state.loading) {
      return <Loading />;
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
});

export default GameScreen;
