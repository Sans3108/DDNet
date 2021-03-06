class PlayerActivity {
  date: { dateString: string; dateObject: Date; year: number; month: number; day: number; };
  hours: number;
  constructor(dateString: string, hours: number) {
    if (typeof dateString !== 'string') throw new TypeError('"dateString" must be of type string.');
    if (typeof hours !== 'number') throw new TypeError('"hours" must be of type number.');
    if (!this.#validateDateString(dateString)) throw new Error('"dateString" is not formatted correctly.');
    if (0 > hours || hours > 24) throw new Error('"hours" must be a number in range 0-24 inclusive.');

    const [year, month, day] = dateString.split('-').map(s => parseInt(s));

    this.date = {
      dateString: dateString,
      dateObject: new Date(dateString),
      year: year,
      month: month,
      day: day
    }
    this.hours = hours;
  }

  #validateDateString(str: string) {
    const arr = str.split('-').map(s => parseInt(s));
    const [year, month, day] = arr;

    if (
      year > 2100 || // arbitrary number cuz y not
      year < 2000 ||
      month > 12 ||
      month < 1 ||
      day > 31 ||
      day < 1 ||
      arr.length !== 3 ||
      new Date(str).toString() === 'Invalid Date'
    ) return false;

    return true;
  }
}

export { PlayerActivity };