import { Leaderboard } from './Leaderboard.js';
import { Rank } from './Rank.js';

/**
 * Represents global leaderboard stats.
 */
export class GlobalLeaderboard extends Leaderboard {
  /**
   * Player rank for last month.
   */
  public completionistLastMonth: Rank | null;

  /**
   * Player rank for last week.
   */
  public completionistLastWeek: Rank | null;

  /**
   * Construct a new {@link GlobalLeaderboard} instance.
   */
  constructor(data: { completionist: Rank; completionistLastMonth: Rank | null; completionistLastWeek: Rank | null; team: Rank | null; rank: Rank | null }) {
    super(data);

    this.completionistLastMonth = data.completionistLastMonth;
    this.completionistLastWeek = data.completionistLastWeek;
  }
}
