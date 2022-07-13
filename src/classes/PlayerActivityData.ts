import PlayerActivity from "./PlayerActivity.js";

class PlayerActivityData {
  activities: PlayerActivity[];
  thisYear: PlayerActivity[];
  thisMonth: PlayerActivity[];
  today: PlayerActivity[];
  constructor(activities: PlayerActivity[]) {
    let valid = true;
    activities.forEach(a => {
      if (!(a instanceof PlayerActivity)) valid = false;
    });
    if (!valid) throw new TypeError('At least 1 item in "activities" is not an instance of PlayerActivity.');

    this.activities = activities.map(a => new PlayerActivity(a.date.dateString, a.hours));
    this.thisYear = this.activities.filter(a => a.date.year === new Date().getFullYear());
    this.thisMonth = this.thisYear.filter(a => a.date.month === (new Date().getMonth() + 1));
    this.today = this.thisMonth.filter(a => a.date.day === new Date().getDate());
  }
}

export default PlayerActivityData;