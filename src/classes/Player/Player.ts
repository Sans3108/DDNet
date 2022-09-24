import { PlayerData, APIPlayerData } from "../Requests/PlayerData.js";
import { Run } from "./MapFinish.js";
import { Partner } from "./Partner.js";
import { MapSet } from "./MapSet.js";
import { MapInfo } from "./MapInfo.js";
import { PlayerActivity } from "./PlayerActivity.js";

class Player {
  name: string;
  url: string;
  ready = false;
  #rawData: {
    fetched: boolean;
    data: APIPlayerData | null;
  }
  readyAt: Date | null = null;
  points: { total: number; lastWeek: number; lastMonth: number; } | null = null;
  firstFinish: Run | null = null;
  finishes: Run[] | null = null;
  partners: Partner[] | null = null;
  maps: { novice: MapSet; moderate: MapSet; brutal: MapSet; insane: MapSet; dummy: MapSet; ddmax: MapSet; oldschool: MapSet; solo: MapSet; race: MapSet; fun: MapSet; } | null = null;
  activity: PlayerActivity[] | null = null;
  constructor(name: string) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');

    this.name = name;
    this.url = `https://ddnet.tw/players/${name}`;

    this.#rawData = {
      fetched: false,
      data: null
    }
  }

  toString() {
    return `${this.name}`;
  }

  async fetch() {
    const request = new PlayerData(this.name);
    const rawData: APIPlayerData = (await request.fetch() as any).data;
    if (!rawData) throw new Error("No data.");

    this.#rawData.data = rawData;
    this.#rawData.fetched = true;
    this.ready = true;

    this.points = this.#getPoints();
    this.firstFinish = this.#getFirstFinish();
    this.finishes = this.#getFinishes();
    this.partners = this.#getPartners();
    this.maps = {
      novice: this.#getNoviceMaps(),
      moderate: this.#getModerateMaps(),
      brutal: this.#getBrutalMaps(),
      insane: this.#getInsaneMaps(),
      dummy: this.#getDummyMaps(),
      ddmax: this.#getDDmaXMaps(),
      oldschool: this.#getOldschoolMaps(),
      solo: this.#getSoloMaps(),
      race: this.#getRaceMaps(),
      fun: this.#getFunMaps()
    };
    this.activity = this.#getActivity();

    this.readyAt = request.readyAt;
    return this;
  }

  #getPoints() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return {
      total: this.#rawData.data!.points?.points || 0,
      lastWeek: this.#rawData.data!.points_last_week?.points || 0,
      lastMonth: this.#rawData.data!.points_last_month?.points || 0
    }
  }

  #getFirstFinish() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new Run(this.#rawData.data!.first_finish.map, this.#rawData.data!.first_finish.time, this.#rawData.data!.first_finish.timestamp);
  }

  #getFinishes() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return this.#rawData.data!.last_finishes.map(m => new Run(m.map, m.time, m.timestamp, m.country, m.type));
  }

  #getPartners() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return this.#rawData.data!.favorite_partners.map(o => new Partner(o.name, o.finishes));
  }

  #getNoviceMaps() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new MapSet(
      this.#rawData.data!.types.Novice.points.points || 0,
      Object.keys(this.#rawData.data!.types.Novice.maps)
        .map(key => {
          return new MapInfo(
            key, this.#rawData.data!.types.Novice.maps[key].points,
            this.#rawData.data!.types.Novice.maps[key].finishes,
            this.#rawData.data!.types.Novice.maps[key].time || -1,
            'Novice'
          );
        }),
      'Novice'
    );
  }

  #getModerateMaps() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new MapSet(
      this.#rawData.data!.types.Moderate.points.points || 0,
      Object.keys(this.#rawData.data!.types.Moderate.maps)
        .map(key => {
          return new MapInfo(
            key, this.#rawData.data!.types.Moderate.maps[key].points,
            this.#rawData.data!.types.Moderate.maps[key].finishes,
            this.#rawData.data!.types.Moderate.maps[key].time || -1,
            'Moderate'
          );
        }),
      'Moderate'
    );
  }

  #getBrutalMaps() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new MapSet(
      this.#rawData.data!.types.Brutal.points.points || 0,
      Object.keys(this.#rawData.data!.types.Brutal.maps)
        .map(key => {
          return new MapInfo(
            key, this.#rawData.data!.types.Brutal.maps[key].points,
            this.#rawData.data!.types.Brutal.maps[key].finishes,
            this.#rawData.data!.types.Brutal.maps[key].time || -1,
            'Brutal'
          );
        }),
      'Brutal'
    );
  }

  #getInsaneMaps() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new MapSet(
      this.#rawData.data!.types.Insane.points.points || 0,
      Object.keys(this.#rawData.data!.types.Insane.maps)
        .map(key => {
          return new MapInfo(
            key, this.#rawData.data!.types.Insane.maps[key].points,
            this.#rawData.data!.types.Insane.maps[key].finishes,
            this.#rawData.data!.types.Insane.maps[key].time || -1,
            'Insane'
          );
        }),
      'Insane'
    );
  }

  #getDummyMaps() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new MapSet(
      this.#rawData.data!.types.Dummy.points.points || 0,
      Object.keys(this.#rawData.data!.types.Dummy.maps)
        .map(key => {
          return new MapInfo(
            key, this.#rawData.data!.types.Dummy.maps[key].points,
            this.#rawData.data!.types.Dummy.maps[key].finishes,
            this.#rawData.data!.types.Dummy.maps[key].time || -1,
            'Dummy'
          );
        }),
      'Dummy'
    );
  }

  #getDDmaXMaps() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new MapSet(
      this.#rawData.data!.types.DDmaX.points.points || 0,
      Object.keys(this.#rawData.data!.types.DDmaX.maps)
        .map(key => {
          return new MapInfo(
            key, this.#rawData.data!.types.DDmaX.maps[key].points,
            this.#rawData.data!.types.DDmaX.maps[key].finishes,
            this.#rawData.data!.types.DDmaX.maps[key].time || -1,
            'DDmaX'
          );
        }),
      'DDmaX'
    );
  }

  #getOldschoolMaps() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new MapSet(
      this.#rawData.data!.types.Oldschool.points.points || 0,
      Object.keys(this.#rawData.data!.types.Oldschool.maps)
        .map(key => {
          return new MapInfo(
            key, this.#rawData.data!.types.Oldschool.maps[key].points,
            this.#rawData.data!.types.Oldschool.maps[key].finishes,
            this.#rawData.data!.types.Oldschool.maps[key].time || -1,
            'Oldschool'
          );
        }),
      'Oldschool'
    );
  }

  #getSoloMaps() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new MapSet(
      this.#rawData.data!.types.Solo.points.points || 0,
      Object.keys(this.#rawData.data!.types.Solo.maps)
        .map(key => {
          return new MapInfo(
            key, this.#rawData.data!.types.Solo.maps[key].points,
            this.#rawData.data!.types.Solo.maps[key].finishes,
            this.#rawData.data!.types.Solo.maps[key].time || -1,
            'Solo'
          );
        }),
      'Solo'
    );
  }

  #getRaceMaps() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new MapSet(
      this.#rawData.data!.types.Race.points.points || 0,
      Object.keys(this.#rawData.data!.types.Race.maps)
        .map(key => {
          return new MapInfo(
            key, this.#rawData.data!.types.Race.maps[key].points,
            this.#rawData.data!.types.Race.maps[key].finishes,
            this.#rawData.data!.types.Race.maps[key].time || -1,
            'Race'
          );
        }),
      'Race'
    );
  }

  #getFunMaps() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return new MapSet(
      this.#rawData.data!.types.Fun.points.points || 0,
      Object.keys(this.#rawData.data!.types.Fun.maps)
        .map(key => {
          return new MapInfo(
            key, this.#rawData.data!.types.Fun.maps[key].points,
            this.#rawData.data!.types.Fun.maps[key].finishes,
            this.#rawData.data!.types.Fun.maps[key].time || -1,
            'Fun'
          );
        }),
      'Fun'
    );
  }

  #getActivity() {
    if (!this.#rawData.fetched) throw new Error('No data available.');

    return this.#rawData.data!.activity.map(a => new PlayerActivity(a.date, a.hours_played));
  }
}

export { Player };
