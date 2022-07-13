import PlayerAPIRequest, { type _PlayerAPIData } from "./PlayerAPIRequest.js";
import PlayerMapFinish from "./PlayerMapFinish.js";
import Partner from "./Partner.js";
import PlayerMapInfo from "./PlayerMapInfo.js";
import PlayerPoints from "./PlayerPoints.js";
import PlayerMapSet from "./PlayerMapSet.js";
import PlayerActivityData from "./PlayerActivityData.js";
import PlayerActivity from "./PlayerActivity.js";

class Player {
  name: string;
  url: string;
  ready: boolean;
  points!: PlayerPoints;
  finishes!: { first: PlayerMapFinish; last10: PlayerMapFinish[]; };
  partners!: Partner[];
  mapSets!: { novice: PlayerMapSet; moderate: PlayerMapSet; brutal: PlayerMapSet; insane: PlayerMapSet; dummy: PlayerMapSet; ddmax: PlayerMapSet; oldschool: PlayerMapSet; solo: PlayerMapSet; race: PlayerMapSet; fun: PlayerMapSet; };
  timestamp!: number | null;
  activityData!: PlayerActivityData;
  constructor(name: string) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');

    this.name = name;
    this.url = `https://ddnet.tw/players/${name}`;
    this.ready = false;

    this.init();
  }

  async init() {
    const request = new PlayerAPIRequest(this.name);
    const rawData: _PlayerAPIData = (await request.fetch() as any).data;
    if (!rawData) throw new Error("No data.");

    this.points = new PlayerPoints(rawData.points.points || 0, rawData.points_last_month.points || 0, rawData.points_last_week.points || 0);

    this.finishes = {
      first: new PlayerMapFinish(rawData.first_finish.timestamp, rawData.first_finish.map, rawData.first_finish.time),
      last10: rawData.last_finishes.map(o => new PlayerMapFinish(o.timestamp, o.map, o.time, o.country, o.type))
    }
    this.partners = rawData.favorite_partners.map(o => new Partner(o.name, o.finishes));
    this.mapSets = {
      novice: new PlayerMapSet(rawData.types.Novice.points.points || 0, Object.keys(rawData.types.Novice.maps).map(key => new PlayerMapInfo(key, rawData.types.Novice.maps[key].points, rawData.types.Novice.maps[key].finishes, rawData.types.Novice.maps[key].time || -1))),
      moderate: new PlayerMapSet(rawData.types.Moderate.points.points || 0, Object.keys(rawData.types.Moderate.maps).map(key => new PlayerMapInfo(key, rawData.types.Moderate.maps[key].points, rawData.types.Moderate.maps[key].finishes, rawData.types.Moderate.maps[key].time || -1))),
      brutal: new PlayerMapSet(rawData.types.Brutal.points.points || 0, Object.keys(rawData.types.Brutal.maps).map(key => new PlayerMapInfo(key, rawData.types.Brutal.maps[key].points, rawData.types.Brutal.maps[key].finishes, rawData.types.Brutal.maps[key].time || -1))),
      insane: new PlayerMapSet(rawData.types.Insane.points.points || 0, Object.keys(rawData.types.Insane.maps).map(key => new PlayerMapInfo(key, rawData.types.Insane.maps[key].points, rawData.types.Insane.maps[key].finishes, rawData.types.Insane.maps[key].time || -1))),
      dummy: new PlayerMapSet(rawData.types.Dummy.points.points || 0, Object.keys(rawData.types.Dummy.maps).map(key => new PlayerMapInfo(key, rawData.types.Dummy.maps[key].points, rawData.types.Dummy.maps[key].finishes, rawData.types.Dummy.maps[key].time || -1))),
      ddmax: new PlayerMapSet(rawData.types.DDmaX.points.points || 0, Object.keys(rawData.types.DDmaX.maps).map(key => new PlayerMapInfo(key, rawData.types.DDmaX.maps[key].points, rawData.types.DDmaX.maps[key].finishes, rawData.types.DDmaX.maps[key].time || -1))),
      oldschool: new PlayerMapSet(rawData.types.Oldschool.points.points || 0, Object.keys(rawData.types.Oldschool.maps).map(key => new PlayerMapInfo(key, rawData.types.Oldschool.maps[key].points, rawData.types.Oldschool.maps[key].finishes, rawData.types.Oldschool.maps[key].time || -1))),
      solo: new PlayerMapSet(rawData.types.Solo.points.points || 0, Object.keys(rawData.types.Solo.maps).map(key => new PlayerMapInfo(key, rawData.types.Solo.maps[key].points, rawData.types.Solo.maps[key].finishes, rawData.types.Solo.maps[key].time || -1))),
      race: new PlayerMapSet(rawData.types.Race.points.points || 0, Object.keys(rawData.types.Race.maps).map(key => new PlayerMapInfo(key, rawData.types.Race.maps[key].points, rawData.types.Race.maps[key].finishes, rawData.types.Race.maps[key].time || -1))),
      fun: new PlayerMapSet(rawData.types.Fun.points.points || 0, Object.keys(rawData.types.Fun.maps).map(key => new PlayerMapInfo(key, rawData.types.Fun.maps[key].points, rawData.types.Fun.maps[key].finishes, rawData.types.Fun.maps[key].time || -1)))
    }

    this.activityData = new PlayerActivityData(rawData.activity.map(a => new PlayerActivity(a.date, a.hours_played)));

    this.ready = true;
    this.timestamp = request.timestamp;
    return this;
  }
}

export default Player;