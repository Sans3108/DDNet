export class PlayerPartner {
  public name: string;
  public finishes: number;

  constructor(data: { name: string; finishes: number }) {
    this.name = data.name;
    this.finishes = data.finishes;
  }
}
