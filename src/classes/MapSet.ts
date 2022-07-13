import PlayerMapInfo from "./PlayerMapInfo.js";

class MapSet {
  maps: PlayerMapInfo[];
  points: number;
  constructor(maps: PlayerMapInfo[]) {
    let valid = true;
    maps.forEach(map => {
      if (!(map instanceof PlayerMapInfo)) valid = false;
    });
    if (!valid) throw new TypeError('At least 1 item in "maps" is not an instance of PlayerMapInfo.');

    this.maps = maps;
    this.points = this.#calcPoints(maps);
  }

  #calcPoints(mapSet: PlayerMapInfo[]) {
    let p = 0;
    mapSet.forEach(map => {
      p += map.reward;
    });
    return p;
  }
}

export default MapSet;