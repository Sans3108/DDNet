import { Category } from "../Requests/PlayerData.js";
import { FinishTime } from "./Run.js";

class MapInfo {
  name: string;
  points: number;
  finishes: number;
  time: FinishTime;
  category: Category;
  constructor(name: string, points: number, finishes: number, time: number, category: Category) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');
    if (typeof points !== 'number') throw new TypeError('"points" must be of type number.');
    if (typeof finishes !== 'number') throw new TypeError('"finishes" must be of type number.');
    if (typeof time !== 'number') throw new TypeError('"time" must be of type number.');

    this.name = name;
    this.points = points;
    this.finishes = finishes;
    this.time = new FinishTime(time);
    this.category = category;
  }

  // add .toMap()
}

export { MapInfo };