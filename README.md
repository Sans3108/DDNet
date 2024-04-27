# DDNet

# This readme is outdated!

## A new one is coming as soon as possible.

Hey there, this package is very early in development, if you have questions, feedback you can find me over on Discord, my tag is `Sans#0001`.

(Better) Documentation coming soon™️

## Example Usage

Import the `Player` class from the package and create a new instance of it.

```js
import { Player } from 'ddnet';

// or

const { Player } = require('ddnet');
```

```js
const me = new Player('Sans3108');

console.log(me);
/* Output:

Player {
  name: 'Sans3108',
  url: 'https://ddnet.tw/players/Sans3108',
  ready: false,
  readyAt: null,
  points: null,
  firstFinish: null,
  finishes: null,
  partners: null,
  maps: null,
  activity: null
}

*/
```

There is no data yet, there is just some basic info such as name and the url to the player's profile.
To get some usable data, you need to call `.fetch()` on the player.

```js
await me.fetch();
console.log(me);

// or

me.fetch().then(data => {
  console.log(data);
});
```

You probably wouldn't want to log everything, just what you need. Examples below show how to log out the points of the player, the first finished map's name and the map with fastest finish time out of all the novice maps:

```js
// Points
import { Player } from 'ddnet';
const player = await new Player('Sans3108').fetch();

console.log(player.points);
/* Output:

{ total: 445, lastWeek: 15, lastMonth: 30 }

*/
```

```js
// First finish
import { Player } from 'ddnet';
const player = await new Player('Sans3108').fetch();

console.log(player.firstFinish.name);
/* Output:

Multeasymap

*/
```

```js
// Fastest finish time of all novice maps
import { Player } from 'ddnet';
const player = await new Player('Sans3108').fetch();

console.log(player.maps.novice.maps.filter(m => m.finishes > 0).sort((a, b) => a.time.finishTime - b.time.finishTime)[0]);
/* Output:

MapInfo {
  name: 'Tangerine',
  points: 1,
  finishes: 4,
  time: FinishTime { finishTime: 42.86, timeString: '00:42' },
  mapType: 'Novice'
}

*/
```

If you've made it this far and think this could actually be useful, please consider contributing to the [repo](https://github.com/Sans3108/DDNet) <3

Any bugs can be reported [here](https://github.com/Sans3108/DDNet/issues) or on discord by adding me: `Sans#0001`.
