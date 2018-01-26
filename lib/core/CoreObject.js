class CoreObject {
  objects = [];

  async loadAsync() {
    this.loaded = true;
  }

  update(delta, time) {
    if (!this.loaded) {
      return false;
    }
    for (let object of this.objects) {
      object.update(delta, time);
    }
  }

  setAll = (key, value) => {
    for (let object of this.objects) {
      object[key] = value;
    }
  };
}

export default CoreObject;
