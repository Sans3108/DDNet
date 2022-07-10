import Player from "./Player.js";

class Partner {
  constructor(name, finishes) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');
    if (typeof finishes !== 'number') throw new TypeError('"finishes" must be of type number.');

    this.name = name;
    this.url = `https://ddnet.tw/players/${name}`;
    this.finishes = finishes;
  }

  toPlayer() {
    return new Player(this.name);
  }
}

export default Partner;