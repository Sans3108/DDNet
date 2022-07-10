import fetch from "node-fetch";

class API_Request {
  constructor(type, name) {
    if (typeof type !== 'string') throw new TypeError('"type" must be of type string.');
    const types = ['player'];
    if (!types.includes(type)) throw new TypeError(`"type" must be one of: ${types.join(' | ')}`);

    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');

    const BASE_URL = "https://ddnet.tw";

    if (type === 'player') {
      this.url = `${BASE_URL}/players/?json2=${encodeURIComponent(name)}`;
    }

    this.fetched = false;
    this.timestamp = null;
    this.type = type;
    this.name = name;
    this.data = null;
  }

  async fetch() {
    const DATA = await (await fetch(this.url)).json();
    if (Object.keys(DATA).length === 0) throw new Error(`${this.url} returned no data.`);

    this.data = DATA;
    this.fetched = true;
    this.timestamp = Date.now();

    return this;
  }
}

export default API_Request;
