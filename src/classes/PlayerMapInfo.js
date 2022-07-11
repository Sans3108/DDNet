import FinishTime from "./FinishTime.js";

class PlayerMapInfo {
  /**
   * @param {string} name
   * @param {number} reward
   * @param {number} finishes
   * @param {number} time
   */
  constructor(name, reward, finishes, time) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');
    if (typeof reward !== 'number') throw new TypeError('"reward" must be of type number.');
    if (typeof finishes !== 'number') throw new TypeError('"finishes" must be of type number.');
    if (typeof time !== 'number') throw new TypeError('"time" must be of type number.');

    /** @type {string} */
    this.name = name;
    /** @type {number} */
    this.reward = reward;
    /** @type {number} */
    this.finishes = finishes;
    /** @type {FinishTime} */
    this.record = new FinishTime(time);
  }
}

export default PlayerMapInfo;