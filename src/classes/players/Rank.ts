/**
 * Represents a rank. (A placement + points combo)
 *
 * @remarks
 * The properties may be set to -1 in cases where they're required by design but have no values set. (e.g. recent finishes)
 */
export interface Rank {
  /**
   * The placement obtained.
   */
  placement: number;

  /**
   * The amount of points obtained.
   */
  points: number;
}
