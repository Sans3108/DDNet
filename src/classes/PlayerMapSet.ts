import PlayerMapInfo from "./PlayerMapInfo.js";
import MapSet from "./MapSet.js";

class PlayerMapSet {
  all: MapSet;
  finished: MapSet;
  unfinished: MapSet;
  constructor(points: number, mapSets: PlayerMapInfo[]) {
    if (typeof points !== 'number') throw new TypeError('"time" must be of type number.');

    let valid = true;
    mapSets.forEach(map => {
      if (!(map instanceof PlayerMapInfo)) valid = false;
    });

    if (!valid) throw new TypeError('At least 1 item in "mapSets" is not an instance of PlayerMapInfo.');

    this.all = new MapSet(mapSets);
    this.finished = new MapSet(mapSets.filter(m => m.finishes > 0));
    this.unfinished = new MapSet(mapSets.filter(m => m.finishes === 0));
  }
}

export default PlayerMapSet;