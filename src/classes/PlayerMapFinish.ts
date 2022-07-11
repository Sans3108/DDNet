import FinishTime from "./FinishTime";

class PlayerMapFinish {
  timestamp: number;
  name: string;
  time: FinishTime;
  serverLocation: string | null;
  difficulty: string | null;
  constructor(timestamp: number, mapName: string, time: number, svLocation?: string, difficulty?: string) {
    if (!timestamp || typeof timestamp !== 'number') throw new TypeError('"timestamp" must be of type number.')
    if (!mapName || typeof mapName !== 'string') throw new TypeError('"mapName" must be of type string.');
    if (!time || typeof time !== 'number') throw new TypeError('"timestamp" must be of type number.');
    if (svLocation && typeof svLocation !== 'string') throw new TypeError('"svLocation" must be of type string.');
    if (difficulty && typeof difficulty !== 'string') throw new TypeError('"difficulty" must be of type string.');

    this.timestamp = timestamp;
    this.name = mapName; // replace with Map class when implemented
    this.time = new FinishTime(time);
    this.serverLocation = svLocation || null;
    this.difficulty = difficulty || null;
  }
}

export default PlayerMapFinish;