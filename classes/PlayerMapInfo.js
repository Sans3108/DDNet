import FinishTime from "./FinishTime.js";

class PlayerMapInfo {
  constructor(name, reward, finishes, time) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');
    if (typeof reward !== 'number') throw new TypeError('"reward" must be of type number.');
    if (typeof finishes !== 'number') throw new TypeError('"finishes" must be of type number.');
    if (typeof time !== 'number') throw new TypeError('"time" must be of type number.');

    this.name = name;
    this.reward = reward;
    this.finishes = finishes;
    this.record = new FinishTime(time);
  }
}

export default PlayerMapInfo;