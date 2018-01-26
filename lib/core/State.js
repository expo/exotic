import GameObject from './GameObject';

class State extends GameObject {
  get isBooted() {
    return this._isBooted;
  }

  setIsBooted(value) {
    if (this._isBooted === value) {
      return;
    }

    this._isBooted = value;

    if (value) {
      return this.reset();
    } else {
      return this.kill();
    }
  }
}
export default State;
