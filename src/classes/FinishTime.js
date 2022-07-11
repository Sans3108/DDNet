class FinishTime {
  /**
   * @param {number} d
   */
  #timeString(d) {
    let s = Math.floor(d % 60);
    let m = Math.floor((d * 1000 / (1000 * 60)) % 60);
    let h = Math.floor((d * 1000 / (1000 * 60 * 60)) % 24);

    return `${h > 0 ? `${h}:` : ''}${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
  }

  /**
   * @param {number} time
   */
  constructor(time) {
    if (typeof time !== 'number') throw new TypeError('"time" must be of type number.');

    this.time = time;
    /** @type {string} */
    this.timeString = this.#timeString(time);
  }
}

export default FinishTime;