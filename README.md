# DDNet Readme

[![NPM Version](https://img.shields.io/npm/v/ddnet?logo=npm)](https://www.npmjs.com/package/ddnet) [![NPM Downloads](https://img.shields.io/npm/dm/ddnet?logo=npm&label=Downloads)](https://www.npmjs.com/package/ddnet) [![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/Sans3108/DDNet?logo=github&label=Issues)](https://github.com/Sans3108/DDNet/issues)

A typescript npm package for interacting with data from ddnet.org

## Why?

I was bored, and also I needed a decent package to use for interacting with ddnet.org programatically. It is also my first package and I tried my best to make it as good as possible.

### Notice

This package heavily relies on the type checker for a lot of things, I cannot guarantee safe usage with plain/vanilla JavaScript!

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
  ... (lots of other data)
}
*/
```

You probably wouldn't want to log everything, just what you need. Examples below show how to log out the points of the player, the first finished map's name and the map with fastest finish time out of all the novice maps:

```js
// Points
import { Player } from 'ddnet';
const player = await Player.new('Sans3108');

console.log(player.globalLeaderboard.completionist?.points); // 3421
```

```js
// First finish
import { Player } from 'ddnet';
const player = await Player.new('Sans3108');

console.log(player.finishes.first.mapName); // "Multeasymap"
```

```js
// Fastest finish time of all novice maps
import { Player, isCompletedMapStats } from 'ddnet';
const player = await Player.new('Sans3108');

const completed = player.serverTypes.Novice.maps.filter(isCompletedMapStats);
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
  ... (lots of other data)
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

### Skin rendering

The lib also provides a way to render still images of any skin, in any way (without animated feet)

#### 0.6 (DDNet) skins

With inspiration from [TeeAssembler-2.0](https://github.com/AlexIsTheGuy/TeeAssembler-2.0) by [AlexIsTheGuy](https://github.com/AlexIsTheGuy) and help from [Patiga](https://github.com/Patiga)'s [Tee Rendering documentation](https://github.com/heinrich5991/libtw2/blob/master/doc/tee_rendering.md). It is able to render any 0.6 skin from either a skin name or buffer.

Example usage:

```ts
import { TeeSkin6 } from 'ddnet';

const mySkin = new TeeSkin6({ skinResource: '10Fox' });
const rendered = await mySkin.render(); // Do something with the rendered skin buffer

// Or optionally, save it to a file by providing a file path
await mySkin.render({ saveFilePath: 'my-skin.png' }); // Still returns a buffer
```

_my-skin.png_

![Skin Render Output](https://raw.githubusercontent.com/Sans3108/DDNet/master/misc/my-skin.png)

You can also customize the emote, and direction the tee is looking towards:

```ts
import { TeeSkin6, TeeSkinEyeVariant } from 'ddnet';

const mySkin = new TeeSkin6({ skinResource: '10Fox' });

await mySkin.render({
  saveFilePath: 'my-skin-happy-left.png',
  eyeVariant: TeeSkinEyeVariant.happy,
  viewAngle: 180 // left, since 0 is right
});
```

_my-skin-happy-left.png_

![Skin Render Output](https://raw.githubusercontent.com/Sans3108/DDNet/master/misc/my-skin-happy-left.png)

#### 0.7 (Teeworlds) skins

Very similar to 0.6 skins, the only difference being how the instance is initialized.

Example usage:

```ts
import { TeeSkin7, Color } from 'ddnet';

const skin = new TeeSkin7({
  body: 'fox',
  marking: 'fox',
  eyes: 'negative'
});

const rendered = await skin.render({
  customColors: {
    bodyTWcode: 1102443,
    markingTWcode: -485425166,
    feetTWcode: 1102450,
    eyesTWcode: 1441632
  }
}); // Do something with the rendered skin buffer

// Or optionally, save it to a file by providing a file path
// Tip: You can import an use the Color class to easily specify colors instead of pasting numbers
await skin.render({
  customColors: {
    bodyTWcode: Color.from('#d85407').to('tw'),
    markingTWcode: Color.from('#ffae7098').to('tw'),
    feetTWcode: Color.from('#723920').to('tw'),
    eyesTWcode: Color.from('#161414').to('tw')
  },
  saveFilePath: 'fox.png'
}); // Still returns a buffer
```

_fox.png_

![Skin Render Output](https://raw.githubusercontent.com/Sans3108/DDNet/master/misc/fox.png)

Other customizations remain the same between 0.6 and 0.7 skins such as the emote, eye direction etc.

## Cache

Most classes cache results, this is done using the [keyv](https://www.npmjs.com/package/keyv) and [@keyv/sqlite](https://www.npmjs.com/package/@keyv/sqlite) packages. Cache data is stored in the `ddnet_cache.sqlite` file.

It's not really wise to mess with the cache, but there's a couple things you can do, mainly changing the TTL (Time-To-Live) of the cached items[\*]() the class is responsible for, and clearing different cache pools.

<sub>\* _Applies to newly added items_</sub>

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

This readme may not showcase everything, but that's why the [documentation website](https://ddnet.js.org) exists! Please check it out, explore and find what you need there if it wasn't shown here.

If something is missing or you would like to suggest something please [submit an issue](https://github.com/Sans3108/DDNet/issues/new) about it!

If you've made it this far and you consider this package useful, please consider starring [this repository](https://github.com/Sans3108/DDNet) so more people can see it!

[![GitHub Repo stars](https://img.shields.io/github/stars/Sans3108/DDNet)](https://github.com/Sans3108/DDNet)

Any bugs can be reported [here](https://github.com/Sans3108/DDNet/issues) or on discord by adding me: `Sans#0001`.
