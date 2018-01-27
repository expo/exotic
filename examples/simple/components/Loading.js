import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import Assets from '../Assets';

class Loading extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={Assets.images['loading.gif']} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    minWidth: '25%',
    maxWidth: '25%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
});

export default Loading;
