import { GameView } from '@expo/exotic';
import React from 'react';

import Game from './Game';
class App extends React.Component {
  game = new Game();
  render = () => <GameView {...this.game} />;
}

export default App;
