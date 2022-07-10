class PlayerPoints {
  constructor(total, lastWeek, lastMonth) {
    if (typeof total !== 'number') throw new TypeError('"total" must be of type number.');
    if (typeof lastWeek !== 'number') throw new TypeError('"lastWeek" must be of type number.');
    if (typeof lastMonth !== 'number') throw new TypeError('"lastMonth" must be of type number.');

    this.total = total;
    this.lastWeek = lastWeek;
    this.lastMonth = lastMonth;
  }
}

export default PlayerPoints;