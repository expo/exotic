import ExpoGraphics from 'expo-graphics';
import React from 'react';
import TouchableView from './TouchableView';
import { THREE } from 'expo-three';
import PropTypes from 'prop-types';
class GameView extends React.Component {
  static propTypes = {
    ...TouchableView.propTypes,
    ...ExpoGraphics.View.propTypes,
    update: PropTypes.func.isRequired,
    id: PropTypes.string,
  };
  static defaultProps = {
    id: '',
    onTouchesBegan: () => {},
    onTouchesMoved: () => {},
    onTouchesEnded: () => {},
    onTouchesCancelled: () => {},
    onStartShouldSetPanResponderCapture: () => true,
  };

  componentWillMount() {
    THREE.suppressExpoWarnings(true);
  }
  componentWillUnmount() {
    THREE.suppressExpoWarnings(false);
  }

  render() {
    const {
      style,
      id,
      onContextCreate,
      update,
      onTouchesBegan,
      onTouchesMoved,
      onTouchesEnded,
      onTouchesCancelled,
      onResize,
      ...props
    } = this.props;
    return (
      <TouchableView
        id={`game-touchable-${id}`}
        style={[{ flex: 1 }, style]}
        shouldCancelWhenOutside={false}
        onTouchesBegan={onTouchesBegan}
        onTouchesMoved={onTouchesMoved}
        onTouchesEnded={onTouchesEnded}
        onTouchesCancelled={onTouchesCancelled}>
        <ExpoGraphics.View
          {...props}
          onContextCreate={onContextCreate}
          onRender={delta => update(delta, new Date().getTime() / 1000)}
          onResize={onResize}
        />
      </TouchableView>
    );
  }
}

export default GameView;
