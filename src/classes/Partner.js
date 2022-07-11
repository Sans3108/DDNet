import Player from "./Player.js";

class Partner {
  /**
   * @param {string} name
   * @param {number} finishes
   */
  constructor(name, finishes) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');
    if (typeof finishes !== 'number') throw new TypeError('"finishes" must be of type number.');

		/** @type {string} */
    this.name = name;
		/** @type {string} */
    this.url = `https://ddnet.tw/players/${name}`;
		/** @type {number} */
    this.finishes = finishes;
  }

  toPlayer() {
    return new Player(this.name);
  }
}

export default Partner;