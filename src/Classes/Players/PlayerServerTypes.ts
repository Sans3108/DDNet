import { MapType, PlayerServer } from '@classes';
import { DDNetError } from '@util';

// This code screams "please end me"
// Surely there's a better way but I have no idea

export class PlayerServerTypes {
  public novice: PlayerServer;
  public moderate: PlayerServer;
  public brutal: PlayerServer;
  public insane: PlayerServer;
  public dummy: PlayerServer;
  public ddmaxEasy: PlayerServer;
  public ddmaxNext: PlayerServer;
  public ddmaxPro: PlayerServer;
  public ddmaxNut: PlayerServer;
  public oldschool: PlayerServer;
  public solo: PlayerServer;
  public race: PlayerServer;
  public fun: PlayerServer;

  constructor(data: PlayerServer[]) {
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

    this.novice = novice as PlayerServer;
    this.moderate = moderate as PlayerServer;
    this.brutal = brutal as PlayerServer;
    this.insane = insane as PlayerServer;
    this.dummy = dummy as PlayerServer;
    this.ddmaxEasy = ddmaxEasy as PlayerServer;
    this.ddmaxNext = ddmaxNext as PlayerServer;
    this.ddmaxPro = ddmaxPro as PlayerServer;
    this.ddmaxNut = ddmaxNut as PlayerServer;
    this.oldschool = oldschool as PlayerServer;
    this.solo = solo as PlayerServer;
    this.race = race as PlayerServer;
    this.fun = fun as PlayerServer;
  }
}
