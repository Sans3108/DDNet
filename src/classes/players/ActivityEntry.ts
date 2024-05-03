/**
 * Represents a player activity entry.
 */
export class ActivityEntry {
  /**
   * The timestamp of this activity.
   *
   * @remarks
   * Internally, this timestamp is only accurate to the day (hours, minutes etc. are zeroed out)
   * because the data this gets generated from is in the ISO 8601 format as per python's `Datetime#isoformat` method
   * thus only providing the day, month and year of this activity.
   *
   * @privateRemarks
   * This was only tested to work with ISO 8601 formatted strings.
   *
   * @see
   * [Original](https://github.com/ddnet/ddnet-scripts/blob/8e0909edbeb5d7a6446349dc66a3beb0f5ddccc7/servers/scripts/players.py#L537)
   */
  public timestamp: number;

  /**
   * Number of hours played on this day.
   *
   * @remarks This can be 0 if less than an hour has been played on this day.
   */
  public hours: number;

  /**
   * Construct a new {@link ActivityEntry} instance.
   */
  constructor(data: { date: string; hoursPlayed: number }) {
    this.timestamp = new Date(data.date).getTime();
    this.hours = data.hoursPlayed;
  }
}
