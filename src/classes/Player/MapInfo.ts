import { MapType } from "../Requests/PlayerData.js";
import { FinishTime } from "./MapFinish.js";

class MapInfo {
  name: string;
  points: number;
  finishes: number;
  time: FinishTime;
  mapType: MapType;
  constructor(name: string, points: number, finishes: number, time: number, mapType: MapType) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');
    if (typeof points !== 'number') throw new TypeError('"points" must be of type number.');
    if (typeof finishes !== 'number') throw new TypeError('"finishes" must be of type number.');
    if (typeof time !== 'number') throw new TypeError('"time" must be of type number.');

    this.name = name;
    this.points = points;
    this.finishes = finishes;
    this.time = new FinishTime(time);
    this.mapType = mapType;
  }

  // add .toMap()
}

export { MapInfo };