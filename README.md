# DDNet

![NPM Version](https://img.shields.io/npm/v/ddnet?logo=npm&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fddnet) ![NPM Downloads](https://img.shields.io/npm/dm/ddnet?logo=npm&label=Downloads&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fddnet) ![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/Sans3108/DDNet?logo=github&label=Issues&link=https%3A%2F%2Fgithub.com%2FSans3108%2FDDNet%2Fissues)

A typescript npm package for interacting with data from ddnet.org

## Why?

I was bored, and also I needed a decent package to use for interacting with ddnet.org programatically.

## Example Usage

Import the `Player` class from the package and create a new instance of it.

```ts
import { Player } from 'ddnet';

const me = new Player('Sans3108');

console.log(me);

/*
Player {
  name: 'Sans3108',
  url: 'https://ddnet.org/players/Sans3108',
  globalLeaderboard: GlobalLeaderboard {
    completionist: { placement: 8462, points: 2740 },
    team: null,
    rank: null,
    completionistLastMonth: { placement: 3003, points: 224 },
    completionistLastWeek: { placement: 1570, points: 89 }
  },
  totalCompletionistPoints: 32136,
  favoriteServer: 'GER',
  finishes: Finishes {
    first: Finish {
      timestamp: 1628418102000,
      mapName: 'Multeasymap',
      timeSeconds: 2484.68,
      timeString: '41:24',
      rank: [Object],
      region: 'UNK',
      players: [Array]
    },
    recent: [
      [RecentFinish],
      ...
    ]
  },
  favoritePartners: [
    Partner { name: 'SPOOK04', finishes: 7 },
    ...
  ],
  serverTypes: Servers {
    novice: ServerStats {
      name: 'Novice',
      leaderboard: [Leaderboard],
      totalCompletionistPoints: 537,
      maps: [Array]
    },
    ...
  },
  activity: [
    Activity { timestamp: 1627689600000, hours: 1 },
    ...   
  ],
  hoursPlayedPast365days: 369
}
*/
```

You probably wouldn't want to log everything, just what you need. Examples below show how to log out the points of the player, the first finished map's name and the map with fastest finish time out of all the novice maps:

```js
// Points
import { Player } from 'ddnet';
const player = await Player.new('Sans3108');

console.log(player.globalLeaderboard.completionist?.points); // 2740
```

```js
// First finish
import { Player } from 'ddnet';
const player = await Player.new('Sans3108');

console.log(player.finishes.first.mapName); // "Multeasymap"
```

```js
// Fastest finish time of all novice maps
import { Player, CompletedMapStats } from 'ddnet';
const player = await Player.new('Sans3108');

const completed = player.serverTypes.novice.maps.filter(map => map.finishCount > 0) as CompletedMapStats[];
const fastestTime = completed.sort((a, b) => a.bestTimeSeconds - b.bestTimeSeconds)[0];

console.log(fastestTime);
/*
CompletedMapStats {
  mapName: 'Tangerine',
  mapType: 'Novice',
  points: 1,
  placement: 7264,
  firstFinishTimestamp: 1637630856000,
  bestTimeSeconds: 42.86,
  bestTimeString: '00:42',
  finishCount: 6,
  teamRank: 112
}
*/
```

If you've made it this far and you consider this package useful, please consider starring this repository so more people can see it!

![GitHub Repo stars](https://img.shields.io/github/stars/Sans3108/DDNet?link=https%3A%2F%2Fgithub.com%2FSans3108%2FDDNet)

Any bugs can be reported [here](https://github.com/Sans3108/DDNet/issues) or on discord by adding me: `Sans#0001`.
