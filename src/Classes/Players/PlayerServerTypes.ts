import { PlayerServerType } from '@classes';
import { DDNetError, MapType } from '@util';

// This code screams "please end me"
// Surely there's a better way but I have no idea

export class PlayerServerTypes {
  public novice: PlayerServerType;
  public moderate: PlayerServerType;
  public brutal: PlayerServerType;
  public insane: PlayerServerType;
  public dummy: PlayerServerType;
  public ddmaxEasy: PlayerServerType;
  public ddmaxNext: PlayerServerType;
  public ddmaxPro: PlayerServerType;
  public ddmaxNut: PlayerServerType;
  public oldschool: PlayerServerType;
  public solo: PlayerServerType;
  public race: PlayerServerType;
  public fun: PlayerServerType;

  constructor(data: PlayerServerType[]) {
    const novice = data.find(server => server.name === MapType.novice) ?? new DDNetError(`\`${MapType.novice}\` server not found in data!`);
    const moderate = data.find(server => server.name === MapType.moderate) ?? new DDNetError(`\`${MapType.moderate}\` server not found in data!`);
    const brutal = data.find(server => server.name === MapType.brutal) ?? new DDNetError(`\`${MapType.brutal}\` server not found in data!`);
    const insane = data.find(server => server.name === MapType.insane) ?? new DDNetError(`\`${MapType.insane}\` server not found in data!`);
    const dummy = data.find(server => server.name === MapType.dummy) ?? new DDNetError(`\`${MapType.dummy}\` server not found in data!`);
    const ddmaxEasy = data.find(server => server.name === MapType.ddmaxEasy) ?? new DDNetError(`\`${MapType.ddmaxEasy}\` server not found in data!`);
    const ddmaxNext = data.find(server => server.name === MapType.ddmaxNext) ?? new DDNetError(`\`${MapType.ddmaxNext}\` server not found in data!`);
    const ddmaxPro = data.find(server => server.name === MapType.ddmaxPro) ?? new DDNetError(`\`${MapType.ddmaxPro}\` server not found in data!`);
    const ddmaxNut = data.find(server => server.name === MapType.ddmaxNut) ?? new DDNetError(`\`${MapType.ddmaxNut}\` server not found in data!`);
    const oldschool = data.find(server => server.name === MapType.oldschool) ?? new DDNetError(`\`${MapType.oldschool}\` server not found in data!`);
    const solo = data.find(server => server.name === MapType.solo) ?? new DDNetError(`\`${MapType.solo}\` server not found in data!`);
    const race = data.find(server => server.name === MapType.race) ?? new DDNetError(`\`${MapType.race}\` server not found in data!`);
    const fun = data.find(server => server.name === MapType.fun) ?? new DDNetError(`\`${MapType.fun}\` server not found in data!`);

    const types = [novice, moderate, brutal, insane, dummy, ddmaxEasy, ddmaxNext, ddmaxPro, ddmaxNut, oldschool, solo, race, fun];

    if (types.some(item => item instanceof DDNetError))
      throw new DDNetError(
        `Invalid data!`,
        types.filter(i => i instanceof DDNetError)
      );

    this.novice = novice as PlayerServerType;
    this.moderate = moderate as PlayerServerType;
    this.brutal = brutal as PlayerServerType;
    this.insane = insane as PlayerServerType;
    this.dummy = dummy as PlayerServerType;
    this.ddmaxEasy = ddmaxEasy as PlayerServerType;
    this.ddmaxNext = ddmaxNext as PlayerServerType;
    this.ddmaxPro = ddmaxPro as PlayerServerType;
    this.ddmaxNut = ddmaxNut as PlayerServerType;
    this.oldschool = oldschool as PlayerServerType;
    this.solo = solo as PlayerServerType;
    this.race = race as PlayerServerType;
    this.fun = fun as PlayerServerType;
  }
}
