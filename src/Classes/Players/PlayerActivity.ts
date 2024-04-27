/**
 * Class representing a player activity entry.
 */
export class PlayerActivity {
  /**
   * Timestamp accurate to the day of this player activity.
   */
  public timestamp: number;
  
  /**
   * Number of hours played.
   */
  public hours: number;

  constructor(data: { date: string; hoursPlayed: number }) {
    this.timestamp = new Date(data.date).getTime();
    this.hours = data.hoursPlayed;
  }
}
