/// Basically all from Phasers random module
/// https://github.com/photonstorm/phaser/blob/master/src/math/random-data-generator/RandomDataGenerator.js
import randomColor from 'randomcolor';
import colorToHex from '../utils/colorToHex';

class Random {
  c = 1; // interval
  s0 = 0;
  s1 = 0;
  s2 = 0;
  constructor(seeds) {
    if (seeds) {
      this.init(seeds);
    }
  }

  fromArray = arr => arr[Math.floor(Math.random() * arr.length)];

  color = props => colorToHex(randomColor(props));

  get rnd() {
    const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32

    this.c = t | 0;
    this.s0 = this.s1;
    this.s1 = this.s2;
    this.s2 = t - this.c;

    return this.s2;
  }

  /**
   * Internal method that creates a seed hash.
   *
   * @method Phaser.RandomDataGenerator#hash
   * @private
   * @param {any} data
   * @return {number} hashed value.
   */
  hash = data => {
    let h;
    let n = 0xefc8249d;

    data = data.toString();

    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }

    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  init = seeds => {
    if (typeof seeds === 'string') {
      this.state(seeds);
    } else {
      this.sow(seeds);
    }
  };

  sow = seeds => {
    // Always reset to default seed
    this.s0 = this.hash(' ');
    this.s1 = this.hash(this.s0);
    this.s2 = this.hash(this.s1);
    this.c = 1;

    if (!seeds) {
      return;
    }

    // Apply any seeds
    for (let i = 0; i < seeds.length && seeds[i] != null; i++) {
      const seed = seeds[i];

      this.s0 -= this.hash(seed);
      this.s0 += ~~(this.s0 < 0);
      this.s1 -= this.hash(seed);
      this.s1 += ~~(this.s1 < 0);
      this.s2 -= this.hash(seed);
      this.s2 += ~~(this.s2 < 0);
    }
  };

  /// 0 and 2^32.

  get integer() {
    return this.rnd * 0x100000000;
  }

  /// 0 - 1
  get frac() {
    return this.rnd + ((this.rnd * 0x200000) | 0) * 1.1102230246251565e-16;
  }

  /// 0 and 2^32.
  get real() {
    return this.integer + this.frac;
  }

  integerInRange = (min, max) =>
    Math.floor(this.realInRange(0, max - min + 1) + min);

  between = (min, max) => this.integerInRange(min, max);

  realInRange = (min, max) => this.frac * (max - min) + min;

  get normal() {
    return 1 - 2 * this.frac;
  }
  get uuid() {
    let a = '';
    let b = '';

    for (
      b = a = '';
      a++ < 36;
      b +=
        (~a % 5) | ((a * 3) & 4)
          ? (a ^ 15 ? 8 ^ (this.frac * (a ^ 20 ? 16 : 4)) : 4).toString(16)
          : '-'
    ) {}

    return b;
  }

  pick = array => array[this.integerInRange(0, array.length - 1)];

  get sign() {
    return this.pick([-1, 1]);
  }

  ///  Returns a random member of `array`, favoring the earlier entries.
  weightedPick = array => array[~~(this.frac ** 2 * (array.length - 1) + 0.5)];

  //// Returns a random timestamp between min and max, or between the beginning of 2000 and the end of 2020 if min and max aren't specified.
  timestamp = (min, max) =>
    this.realInRange(min || 946684800000, max || 1577862000000);

  //// Returns a random angle between -180 and 180.
  get degrees() {
    return angle;
  }
  get angle() {
    return this.integerInRange(-180, 180);
  }

  /// Returns a random rotation in radians, between -3.141 and 3.141
  get radians() {
    return this.rotation;
  }
  get rotation() {
    return this.realInRange(-3.141592653589793, 3.141592653589793);
  }

  /**
   * Gets or Sets the state of the generator. This allows you to retain the values
   * that the generator is using between games, i.e. in a game save file.
   *
   * To seed this generator with a previously saved state you can pass it as the
   * `seed` value in your game config, or call this method directly after Phaser has booted.
   *
   * Call this method with no parameters to return the current state.
   *
   * If providing a state it should match the same format that this method
   * returns, which is a string with a header `!rnd` followed by the `c`,
   * `s0`, `s1` and `s2` values respectively, each comma-delimited.
   *
   * @method Phaser.RandomDataGenerator#state
   * @param {string} [state] - Generator state to be set.
   * @return {string} The current state of the generator.
   */
  state(state) {
    if (typeof state === 'string' && state.match(/^!rnd/)) {
      state = state.split(',');

      this.c = parseFloat(state[1]);
      this.s0 = parseFloat(state[2]);
      this.s1 = parseFloat(state[3]);
      this.s2 = parseFloat(state[4]);
    }

    return ['!rnd', this.c, this.s0, this.s1, this.s2].join(',');
  }
}

//// This is from Phaser https://github.com/photonstorm/phaser/blob/f1391d6df812d1f2657e4643716c402d370b5638/wip/core/Game.js#L64
Random.shared = new Random([(Date.now() * Math.random()).toString()]);

export default Random;
