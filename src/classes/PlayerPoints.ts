class PlayerPoints {
  total: number;
  lastWeek: number;
  lastMonth: number;
  constructor(total: number, lastWeek: number, lastMonth: number) {
    if (typeof total !== 'number') throw new TypeError('"total" must be of type number.');
    if (typeof lastWeek !== 'number') throw new TypeError('"lastWeek" must be of type number.');
    if (typeof lastMonth !== 'number') throw new TypeError('"lastMonth" must be of type number.');

    this.total = total;
    this.lastWeek = lastWeek;
    this.lastMonth = lastMonth;
  }
}

export default PlayerPoints;