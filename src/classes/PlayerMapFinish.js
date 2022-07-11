import FinishTime from "./FinishTime.js";

class PlayerMapFinish {
  /**
   * @param {number} timestamp
   * @param {string} mapName
   * @param {number} time
   * @param {string} [svLocation]
   * @param {string} [difficulty]
   */
  constructor(timestamp, mapName, time, svLocation, difficulty) {
    if (!timestamp || typeof timestamp !== 'number') throw new TypeError('"timestamp" must be of type number.')
    if (!mapName || typeof mapName !== 'string') throw new TypeError('"mapName" must be of type string.');
    if (!time || typeof time !== 'number') throw new TypeError('"timestamp" must be of type number.');
    if (svLocation && typeof svLocation !== 'string') throw new TypeError('"svLocation" must be of type string.');
    if (difficulty && typeof difficulty !== 'string') throw new TypeError('"difficulty" must be of type string.');

    /** @type {number} */
    this.timestamp = timestamp;
    /** @type {string} */
    this.name = mapName; // replace with Map class when implemented
    /** @type {FinishTime} */
    this.time = new FinishTime(time);
    /** @type {string | null} */
    this.serverLocation = svLocation || null;
    /** @type {string | null} */
    this.difficulty = difficulty || null;
  }
}

export default PlayerMapFinish;