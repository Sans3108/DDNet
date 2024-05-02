# DDNet Readme

![NPM Version](https://img.shields.io/npm/v/ddnet?logo=npm) ![NPM Downloads](https://img.shields.io/npm/dm/ddnet?logo=npm&label=Downloads) ![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/Sans3108/DDNet?logo=github&label=Issues)

A typescript npm package for interacting with data from ddnet.org

## Why?

I was bored, and also I needed a decent package to use for interacting with ddnet.org programatically. It is also my first package and I tried my best to make it as good as possible.

## Installation

Using your node package manager of choice, for example `pnpm`:

```
$ pnpm add ddnet
```

## Example Usage

### Player class examples

Import the `Player` class from the package and create a new instance of it.

```ts
import { Player } from 'ddnet';

const me = await Player.new('Sans3108');

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

console.log(`${fastestTime.mapName} ${fastestTime.bestTimeString}`); // "Tangerine 00:42"
```

### Map class examples

Let's say you're not interested in player data that much, and you want to check out on some maps, to do that:

```ts
import { Map } from 'ddnet';
const map = await Map.new('Kobra 4');

console.log(map);
/*
Map {
  name: 'Kobra 4',
  url: 'https://ddnet.org/maps/Kobra-32-4',
  thumbnailUrl: 'https://ddnet.org/ranks/maps/Kobra_4.png',
  webPreviewUrl: 'https://ddnet.org/mappreview/?map=Kobra+4',
  type: 'Novice',
  points: 4,
  difficulty: 4,
  mappers: [
    Author {
      name: 'Zerodin',
      mapShowcaseUrl: 'https://ddnet.org/mappers/Zerodin',
      playerUrl: 'https://ddnet.org/players/Zerodin'
    }
  ],
  releasedTimestamp: 1438538340000,
  biggestTeam: 8,
  width: 500,
  height: 500,
  tiles: [
    'DEATH',          'THROUGH',
    'DFREEZE',        'EHOOK_START',
    ...
  ],
  teamFinishes: [
    Finish {
      timestamp: 1662539643000,
      mapName: 'Kobra 4',
      timeSeconds: 693.46,
      timeString: '11:33',
      rank: [Object],
      region: 'CHN',
      players: [Array]
    },
    ...
  ],
  finishes: [
    Finish {
      timestamp: 1662539643000,
      mapName: 'Kobra 4',
      timeSeconds: 693.46,
      timeString: '11:33',
      rank: [Object],
      region: 'CHN',
      players: [Array]
    },
    ...
  ],
  maxFinishes: [
    MaxFinish {
      rank: 1,
      player: 'nameless tee',
      count: 659,
      timeSeconds: 1754617.6977539062,
      timeString: '487:23:37',
      minTimestamp: 1438545584000,
      maxTimestamp: 1714287869000
    },
    ...
  ],
  medianTimeSeconds: 2974.6999511719,
  medianTimeString: '49:34',
  firstFinishTimestamp: 1438539743000,
  lastFinishTimestamp: 1714430160000,
  finishCount: 230707,
  finishersCount: 73166
}
*/
```

Like before, this may be a bit much, so let's see some examples. Here are some showcasing how to get a map's author, the number of points it awards upon completion, and the current time record:

```ts
// Author

import { Map } from 'ddnet';

const map = await Map.new('Grandma');

console.log(map.mappers[0].name); // "Fňokurka oo7"

// If the map has multiple authors, then:
const map = await Map.new('Nagi');

console.log(map.mappers.map(a => a.name).join(' & ')); // "Cøke & Arrow"
```

```ts
// Points
import { Map } from 'ddnet';

const map = await Map.new('EasyRight');

console.log(map.points); // 4
```

```ts
// Current record
import { Map } from 'ddnet';

const map = await Map.new('Baby Aim 1.0');

console.log(`${map.finishes[0].players[0].name} ${map.finishes[0].timeString}`); // "Cireme 06:25"
```

## Building

For building this package yourself you will need at least Node v18.20.2, and some knowledge of typescript. Package manager choice should not matter, but for smooth operations I recommend `pnpm`.

First, clone the repository and navigate to it:

```
$ git clone https://github.com/Sans3108/DDNet.git
$ cd DDNet
```

Install the dependencies with:

```
$ pnpm install
```

After that, you're ready to open up the project in your code editor of choice, or, if you don't wish to change anything, simply run the following command to build the project:

```
$ pnpm build
```

Additionaly you may re-build the `typedoc` documentation website with:

```
$ pnpm typedoc
```

And after that everything in the `/docs` directory should be up to date with your changes.

## Contributions & Notes

Help is always appreciated, if you are able to contribute and have the know-how, please do! I will look over every PR and potentially we can integrate your changes!

This readme may not showcase everything, but that's why the [documentation website](https://sans3108.github.io/DDNet) exists! Please check it out, explore and find what you need there if it wasn't shown here.

If something is missing or you would like to suggest something please [submit an issue](https://github.com/Sans3108/DDNet/issues/new) about it!

If you've made it this far and you consider this package useful, please consider starring [this repository](https://github.com/Sans3108/DDNet) so more people can see it!

![GitHub Repo stars](https://img.shields.io/github/stars/Sans3108/DDNet)

Any bugs can be reported [here](https://github.com/Sans3108/DDNet/issues) or on discord by adding me: `Sans#0001`.
