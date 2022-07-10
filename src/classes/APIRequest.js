import fetch from "node-fetch";

class APIRequest {
  /**
   * @param {string} type
   * @param {string} name
   */
  constructor(type, name) {
    if (typeof type !== 'string') throw new TypeError('"type" must be of type string.');
    const types = ['player'];
    if (!types.includes(type)) throw new TypeError(`"type" must be one of: ${types.join(' | ')}`);

    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');

    const BASE_URL = "https://ddnet.tw";

    if (type === 'player') {
      /** @type {string} */
      this.url = `${BASE_URL}/players/?json2=${encodeURIComponent(name)}`;
    } else {
      throw new TypeError(`"type" must be one of: ${types.join(' | ')}`);
    }

    /** @type {boolean} */
    this.fetched = false;
    /** @type {number | null} */
    this.timestamp = null;
    /** @type {string} */
    this.type = type;
    /** @type {string} */
    this.name = name;
    /** @type {object | null} */
    this.data = null;
  }

  async fetch() {
    const DATA = await (await fetch(this.url)).json();
    if (
      !DATA ||
      Object.keys(DATA).filter(key => Object.hasOwn(DATA, key)).length === 0
    ) throw new Error(`${this.url} returned no data.`);

    this.data = DATA;
    this.fetched = true;
    this.timestamp = Date.now();

    return this;
  }
}

export default APIRequest;
