import { Category, Category_Schema } from "../Requests/PlayerData.js";

class FinishTime {
  finishTime: number;
  timeString: string;

  #timeString(d: number) {
    let s = Math.floor(d % 60);
    let m = Math.floor((d * 1000 / (1000 * 60)) % 60);
    let h = Math.floor((d * 1000 / (1000 * 60 * 60)) % 24);

    return d < 0 ? '--:--' : `${h > 0 ? `${h}:` : ''}${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
  }

  constructor(time: number) {
    if (typeof time !== 'number') throw new TypeError('"time" must be of type number.');

    this.finishTime = time;
    this.timeString = this.#timeString(time);
  }

  toString() {
    return this.#timeString(this.finishTime);
  }
}

class Run {
  name: string;
  time: FinishTime;
  date: Date;
  serverLocation: string | null;
  category: Category | null;

  constructor(mapName: string, time: number, timestamp: number, svLocation?: string, category?: Category) {
    if (typeof mapName !== 'string') throw new TypeError('"mapName" must be of type string.');
    if (typeof time !== 'number') throw new TypeError('"timestamp" must be of type number.');
    if (typeof timestamp !== 'number') throw new TypeError('"timestamp" must be of type number.');
    if (svLocation && typeof svLocation !== 'string') throw new TypeError('"svLocation" must be of type string.');
    if (category && !Category_Schema.safeParse(category).success) throw new TypeError('"category" must be of type string.');

    // Add this.map with a new Map() object once maps have been implemented
    // or add a .toMap() which does as advertised :p

    this.name = mapName;
    this.time = new FinishTime(time);
    this.date = new Date(timestamp * 1000);
    this.serverLocation = svLocation || null;
    this.category = category || null;
  }
}

export { Run, FinishTime };