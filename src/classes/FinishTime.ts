class FinishTime {
  finishTime: number;
  timeString: string;

  #timeString(d: number) {
    let s = Math.floor(d % 60);
    let m = Math.floor((d * 1000 / (1000 * 60)) % 60);
    let h = Math.floor((d * 1000 / (1000 * 60 * 60)) % 24);

    return d < 0 ? '--:--' : `${h > 0 ? `${h}:` : ''}${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
  }

  constructor(time: number) {
    if (typeof time !== 'number') throw new TypeError('"time" must be of type number.');

    this.finishTime = time;
    this.timeString = this.#timeString(time);
  }

  toString() {
    return this.#timeString(this.finishTime);
  }
}

export default FinishTime;