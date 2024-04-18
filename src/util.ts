import got from 'got';

/**
 * Wrapper class for the {@link Error} built-in class, used to also provide different contexts.
 */
export class DDNetError extends Error {
  /**
   * Create a new instance of {@link DDNetError}
   * @param reason The reason for this error.
   * @param context Context for this error, usually an {@link Error} object or a string, ultimately unknown type.
   */
  constructor(
    reason?: string,
    public context?: unknown
  ) {
    super(reason ?? 'ERR');
  }
}

/**
 * Requests all map releases.
 */
export async function makeReleasesRequest(): Promise<object | DDNetError> {
  const url = `https://ddnet.org/releases/maps.json`;

  const response: object | DDNetError = await got(url)
    //@ts-expect-error DT out of date
    .json()
    .catch((err: Error) => new DDNetError(err.message, err));

  if (response instanceof DDNetError) return response;

  return response;
}

/**
 * Handles `players` and `maps` requests, and their different query parameters.
 */
export async function makeRequest(path: 'players', qs: 'json2' | 'query' | 'json', qsValue: string): Promise<object | DDNetError>;
export async function makeRequest(path: 'maps', qs: 'qmapper' | 'query' | 'json', qsValue: string): Promise<object | DDNetError>;
export async function makeRequest(path: string, qs: string, qsValue: string): Promise<object | DDNetError> {
  const url = `https://ddnet.org/${path}/?${qs}=${encodeURIComponent(qsValue)}`;

  const response: object | DDNetError = await got(url)
    //@ts-expect-error DT out of date
    .json()
    .catch((err: Error) => new DDNetError(err.message, err));

  if (response instanceof DDNetError) return response;

  return response;
}

export function timeString(totalSeconds: number): string {
  if (totalSeconds < 0) return '--:--';

  const pad = (s: string) => (s.length < 2 ? `0${s}` : s);

  const hours = Math.floor(totalSeconds / 3600).toString();
  const remainingSecondsAfterHours = totalSeconds % 3600;
  const minutes = Math.floor(remainingSecondsAfterHours / 60).toString();
  const seconds = Math.floor(remainingSecondsAfterHours % 60).toString();

  return hours === '0' ? `${pad(minutes)}:${pad(seconds)}` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
