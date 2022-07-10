import FinishTime from "./FinishTime.js";

class PlayerMapFinish {
  constructor(timestamp, mapName, time, svLocation, difficulty) {
    if (typeof timestamp !== 'number') throw new TypeError('"timestamp" must be of type number.')
    if (typeof mapName !== 'string') throw new TypeError('"mapName" must be of type string.');
    if (typeof time !== 'number') throw new TypeError('"timestamp" must be of type number.');
    if (svLocation && typeof svLocation !== 'string') throw new TypeError('"svLocation" must be of type string.');
    if (difficulty && typeof difficulty !== 'string') throw new TypeError('"difficulty" must be of type string.');

    if (!timestamp || !mapName || !time) throw new Error('Missing arguments! "timestamp", "mapName" and "time" are required.');

    this.timestamp = timestamp;
    this.name = mapName; // replace with Map class when implemented
    this.time = new FinishTime(time);
    this.serverLocation = svLocation || null;
    this.difficulty = difficulty || null;
  }
}

export default PlayerMapFinish;