import API_Request from "./API_Request.js";
import PlayerMapFinish from "./PlayerMapFinish.js";
import Partner from "./Partner.js";
import PlayerMapInfo from "./PlayerMapInfo.js";
import PlayerPoints from "./PlayerPoints.js";

//import hardCopy from "../out.json" assert {type: "json"};

class Player {
  constructor(name) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');

    this.name = name;
    this.url = `https://ddnet.tw/players/${name}`;
    this.ready = false;
    this.init();
  }

  async init() {
    const rawData = await (await new API_Request('player', this.name).fetch()).data;

    this.points = new PlayerPoints(rawData.points.points, rawData.points_last_month.points, rawData.points_last_week.points);
    this.finishes = {
      first: new PlayerMapFinish(rawData.first_finish.timestamp, rawData.first_finish.map, rawData.first_finish.time),
      last10: rawData.last_finishes.map(o => new PlayerMapFinish(o.timestamp, o.map, o.time, o.country, o.type))
    }
    this.partners = rawData.favorite_partners.map(o => new Partner(o.name, o.finishes));
    this.maps = {
      novice: {
        points: rawData.types.Novice.points || 0,
        finished: Object.keys(rawData.types.Novice.maps).map(key => ({ name: key, finishes: rawData.types.Novice.maps[key].finishes })).filter(o => o.finishes > 0).map(o => new PlayerMapInfo(o.name, rawData.types.Novice.maps[o.name].points, o.finishes, rawData.types.Novice.maps[o.name].time)),
      },
      moderate: {
        points: rawData.types.Moderate.points || 0,
        finished: Object.keys(rawData.types.Moderate.maps).map(key => ({ name: key, finishes: rawData.types.Moderate.maps[key].finishes })).filter(o => o.finishes > 0).map(o => new PlayerMapInfo(o.name, rawData.types.Moderate.maps[o.name].points, o.finishes, rawData.types.Moderate.maps[o.name].time)),
      },
      brutal: {
        points: rawData.types.Brutal.points || 0,
        finished: Object.keys(rawData.types.Brutal.maps).map(key => ({ name: key, finishes: rawData.types.Brutal.maps[key].finishes })).filter(o => o.finishes > 0).map(o => new PlayerMapInfo(o.name, rawData.types.Brutal.maps[o.name].points, o.finishes, rawData.types.Brutal.maps[o.name].time)),
      },
      insane: {
        points: rawData.types.Insane.points || 0,
        finished: Object.keys(rawData.types.Insane.maps).map(key => ({ name: key, finishes: rawData.types.Insane.maps[key].finishes })).filter(o => o.finishes > 0).map(o => new PlayerMapInfo(o.name, rawData.types.Insane.maps[o.name].points, o.finishes, rawData.types.Insane.maps[o.name].time)),
      },
      dummy: {
        points: rawData.types.Dummy.points || 0,
        finished: Object.keys(rawData.types.Dummy.maps).map(key => ({ name: key, finishes: rawData.types.Dummy.maps[key].finishes })).filter(o => o.finishes > 0).map(o => new PlayerMapInfo(o.name, rawData.types.Dummy.maps[o.name].points, o.finishes, rawData.types.Dummy.maps[o.name].time)),
      },
      ddmax: {
        points: rawData.types.DDmaX.points || 0,
        finished: Object.keys(rawData.types.DDmaX.maps).map(key => ({ name: key, finishes: rawData.types.DDmaX.maps[key].finishes })).filter(o => o.finishes > 0).map(o => new PlayerMapInfo(o.name, rawData.types.DDmaX.maps[o.name].points, o.finishes, rawData.types.DDmaX.maps[o.name].time)),
      },
      oldschool: {
        points: rawData.types.Oldschool.points || 0,
        finished: Object.keys(rawData.types.Oldschool.maps).map(key => ({ name: key, finishes: rawData.types.Oldschool.maps[key].finishes })).filter(o => o.finishes > 0).map(o => new PlayerMapInfo(o.name, rawData.types.Oldschool.maps[o.name].points, o.finishes, rawData.types.Oldschool.maps[o.name].time)),
      },
      solo: {
        points: rawData.types.Solo.points || 0,
        finished: Object.keys(rawData.types.Solo.maps).map(key => ({ name: key, finishes: rawData.types.Solo.maps[key].finishes })).filter(o => o.finishes > 0).map(o => new PlayerMapInfo(o.name, rawData.types.Solo.maps[o.name].points, o.finishes, rawData.types.Solo.maps[o.name].time)),
      },
      race: {
        points: rawData.types.Race.points || 0,
        finished: Object.keys(rawData.types.Race.maps).map(key => ({ name: key, finishes: rawData.types.Race.maps[key].finishes })).filter(o => o.finishes > 0).map(o => new PlayerMapInfo(o.name, rawData.types.Race.maps[o.name].points, o.finishes, rawData.types.Race.maps[o.name].time)),
      },
      fun: {
        points: rawData.types.Fun.points || 0,
        finished: Object.keys(rawData.types.Fun.maps).map(key => ({ name: key, finishes: rawData.types.Fun.maps[key].finishes })).filter(o => o.finishes > 0).map(o => new PlayerMapInfo(o.name, rawData.types.Fun.maps[o.name].points, o.finishes, rawData.types.Fun.maps[o.name].time))
      }
    }

    this.ready = true;
    return this;
  }
}

export default Player;