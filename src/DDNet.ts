/// <reference path="Master.ts" />

/**
 * The main part of this package, and your starting point for using DDNet data in your own program.
 *
 * @packageDocumentation
 */

//#region Classes

//#region Maps
export * from './classes/maps/Map.js';
export * from './classes/maps/Mapper.js';
export * from './classes/maps/MaxFinish.js';
//#endregion

//#region Other
export * from './classes/other/CacheManager.js';
export * from './classes/other/Finish.js';
export * from './classes/other/Release.js';
export * from './classes/other/Releases.js';
export * from './classes/other/ServerListStatuses.js';
export * from './classes/other/ServerStatus.js';
//#endregion

//#region Players
export * from './classes/players/ActivityEntry.js';
export * from './classes/players/Finishes.js';
export * from './classes/players/GlobalLeaderboard.js';
export * from './classes/players/Leaderboard.js';
export * from './classes/players/MapStats.js';
export * from './classes/players/Partner.js';
export * from './classes/players/Player.js';
export * from './classes/players/Rank.js';
export * from './classes/players/ServerStats.js';
export * from './classes/players/Servers.js';
//#endregion

//#region Skins
export * from './classes/skins/TeeSkin6.js';
//#endregion

//#endregion

//#region Schemas

//#region Maps
export * from './schemas/maps/json.js';
export * from './schemas/maps/qmapper.js';
export * from './schemas/maps/query.js';
//#endregion

//#region Other
export * from './schemas/other/releases.js';
export * from './schemas/other/status.js';
//#endregion

//#region Players
export * from './schemas/players/json.js';
export * from './schemas/players/json2.js';
export * from './schemas/players/query.js';
//#endregion

//#endregion

export * from './util.js';

export { findPlayer } from './Master.js';
