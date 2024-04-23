export * from '@classes';
export * from '@schemas';
export * from '@util';

import { Player, Map } from '@classes';

const me = await Player.new('Sans3108');

if (me.success) {
  console.log(me.instance.finishes.recent);
}

// const m = await Map.new('Grandma');

// if (m.success) {
//   console.log(m.instance.ranks);
//   console.log(m.instance.teamRanks);
// }
