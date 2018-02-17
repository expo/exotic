export default {
  icons: {
    'expo.png': require(`./assets/icons/expo.png`),
  },
  images: {
    'glow.png': require(`./assets/images/glow.png`),
    'loading.gif': require(`./assets/images/loading.gif`),
    skybox: {
      'nx.jpg': require(`./assets/images/skybox/nx.jpg`),
      'ny.jpg': require(`./assets/images/skybox/ny.jpg`),
      'px.jpg': require(`./assets/images/skybox/px.jpg`),
      'py.jpg': require(`./assets/images/skybox/py.jpg`),
      'nz.jpg': require(`./assets/images/skybox/nz.jpg`),
      'pz.jpg': require(`./assets/images/skybox/pz.jpg`),
    },
  },
  fonts: {},
  audio: {},
  models: {
    train: {
      'material.mtl': require(`./assets/models/train/material.mtl`),
      'model.obj': require(`./assets/models/train/model.obj`),
      'texture.png': require(`./assets/models/train/texture.png`),
    },
    gallardo: {
      'GallardoNoUv_bin.bin': require(`./assets/models/gallardo/GallardoNoUv_bin.bin`),
      'GallardoNoUv_bin.json': require(`./assets/models/gallardo/GallardoNoUv_bin.json`),
      parts: {
        'gallardo_body_bin.bin': require(`./assets/models/gallardo/parts/gallardo_body_bin.bin`),
        'gallardo_body_bin.json': require(`./assets/models/gallardo/parts/gallardo_body_bin.json`),
        'gallardo_wheel_bin.json': require(`./assets/models/gallardo/parts/gallardo_wheel_bin.json`),
        'gallardo_wheel_bin.bin': require(`./assets/models/gallardo/parts/gallardo_wheel_bin.bin`),
      },
    },
  },
};
