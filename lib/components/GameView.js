import ExpoGraphics from 'expo-graphics';
import React from 'react';
import TouchableView from './TouchableVIew';
import { THREE } from 'expo-three';
class GameView extends React.Component {
  componentWillMount() {
    THREE.suppressExpoWarnings(true);
  }
  componentWillUnmount() {
    THREE.suppressExpoWarnings(false);
  }

  render = () => (
    <TouchableView
      id="game"
      style={{ flex: 1 }}
      shouldCancelWhenOutside={false}
      onTouchesBegan={this.props.onTouchesBegan}
      onTouchesMoved={this.props.onTouchesMoved}
      onTouchesEnded={this.props.onTouchesEnded}
      onTouchesCancelled={this.props.onTouchesCancelled}
    >
      <ExpoGraphics.View
        onContextCreate={this.props.onContextCreate}
        onRender={delta =>
          this.props.update(delta, new Date().getTime() / 1000)
        }
        onResize={this.props.onResize}
      />
    </TouchableView>
  );
}

export default GameView;
