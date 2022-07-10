class PlayerPoints {
  /**
     * @param {number} total
     * @param {number} lastWeek
     * @param {number} lastMonth
     */
  constructor(total, lastWeek, lastMonth) {
    if (typeof total !== 'number') throw new TypeError('"total" must be of type number.');
    if (typeof lastWeek !== 'number') throw new TypeError('"lastWeek" must be of type number.');
    if (typeof lastMonth !== 'number') throw new TypeError('"lastMonth" must be of type number.');

    /** @type {number} */
    this.total = total;
    /** @type {number} */
    this.lastWeek = lastWeek;
    /** @type {number} */
    this.lastMonth = lastMonth;
  }
}

export default PlayerPoints;