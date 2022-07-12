import PlayerMapInfo from "./PlayerMapInfo.js";

class PlayerMapSet {
  points: number;
  all: PlayerMapInfo[];
  finished: PlayerMapInfo[];
  unfinished: PlayerMapInfo[];
  constructor(points: number, mapSets: PlayerMapInfo[]) {
    if (typeof points !== 'number') throw new TypeError('"time" must be of type number.');

    let valid = true;
    mapSets.forEach(map => {
      if (map !instanceof PlayerMapInfo) valid = false;
    });

    this.points = points;
    this.all = mapSets;
    this.finished = mapSets.filter(m => m.finishes > 0);
    this.unfinished = mapSets.filter(m => m.finishes === 0);
  }
}

export default PlayerMapSet;