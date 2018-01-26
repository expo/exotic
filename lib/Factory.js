import flatMaterial from './utils/flatMaterial';

class Factory {
  materials = {};

  initMaterials = colors => {
    Object.keys(colors).map(key => {
      this.materials[key] = flatMaterial({ color: colors[key] });
    });
  };
}

global.factory = Factory.shared = new Factory();

export default Factory;
