export class PlayerActivity {
  public timestamp: number;
  public hours: number;

  constructor(data: { date: string; hoursPlayed: number }) {
    this.timestamp = new Date(data.date).getTime();
    this.hours = data.hoursPlayed;
  }
}
