import { Category } from "../Requests/PlayerData.js";
import { MapInfo } from "./MapInfo.js";

class MapSet {
  points: number;
  maps: MapInfo[];
  category: Category;
  constructor(points: number, maps: MapInfo[], category: Category) {
    if (typeof points !== 'number') throw new TypeError('"points" must be of type number.');
    let mapsValid = true;
    maps.forEach(m => {
      if (!(m instanceof MapInfo)) mapsValid = false;
    });
    if (!mapsValid) throw new TypeError('At least 1 item in "maps" is not an instance of MapInfo.');

    this.points = points;
    this.maps = maps;
    this.category = category;

    //add finished, unfinished etc
  }
}

export { MapSet }; 