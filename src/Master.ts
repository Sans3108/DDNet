// To parse this data:
//
//   import { Convert, Master } from "./file";
//
//   const master = Convert.toMaster(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

/**
 * Generated using https://quicktype.io/
 *
 * I did not dive into this because the master server is written in rust, and I don't know rust.
 * Besides types, this is (mostly if not at all) undocumented and I'm not sure how correct are the types.
 *
 * @packageDocumentation
 */

export interface Master {
  servers: Server[];
}

export interface Server {
  addresses: string[];
  location?: Location;
  info: Info;
}

export interface Info {
  max_clients: number;
  max_players: number;
  passworded: boolean;
  game_type: string;
  name: string;
  map: _Map;
  version: string;
  clients: Client[];
  client_score_kind?: ClientScoreKind;
  requires_login?: boolean;
  community?: Community;
  altameda_net?: boolean;
}

export enum ClientScoreKind {
  Points = 'points',
  Score = 'score',
  Time = 'time'
}

export interface Client {
  name: string;
  clan: string;
  country: number;
  score: number;
  is_player: boolean;
  skin?: Skin;
  afk?: boolean;
  team?: number;
}

export interface Skin {
  name?: string;
  color_body?: number;
  color_feet?: number;
  body?: Body;
  marking?: Body;
  decoration?: Body;
  hands?: Body;
  feet?: Body;
  eyes?: Body;
}

export interface Body {
  name: Name;
  color?: number;
}

export enum Name {
  Empty = '',
  Standard = 'standard'
}

export interface Community {
  id: ID;
  icon: string;
  admin: string[];
  public_key: string;
  signature: string;
}

export enum ID {
  UrnCommunityKog = 'urn:community:kog'
}

export interface _Map {
  name: string;
  sha256?: string;
  size?: number;
}

export enum Location {
  AF = 'af',
  As = 'as',
  AsCN = 'as:cn',
  Eu = 'eu',
  Na = 'na',
  Oc = 'oc',
  Sa = 'sa'
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toMaster(json: string): Master {
    return cast(JSON.parse(json), r('Master'));
  }

  public static masterToJson(value: Master): string {
    return JSON.stringify(uncast(value, r('Master')), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : '';
  const keyText = key ? ` for key "${key}"` : '';
  throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map(a => {
          return prettyTypeName(a);
        })
        .join(', ')}]`;
    }
  } else if (typeof typ === 'object' && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map(a => {
        return l(a);
      }),
      val,
      key,
      parent
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent);
    return val.map(el => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l('Date'), val, key, parent);
    }
    return d;
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue(l(ref || 'object'), val, key, parent);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach(key => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === 'any') return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === 'object' && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === 'object') {
    return (
      typ.hasOwnProperty('unionMembers') ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems') ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty('props') ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent)
    );
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  Master: o([{ json: 'servers', js: 'servers', typ: a(r('Server')) }], false),
  Server: o(
    [
      { json: 'addresses', js: 'addresses', typ: a('') },
      { json: 'location', js: 'location', typ: u(undefined, r('Location')) },
      { json: 'info', js: 'info', typ: r('Info') }
    ],
    false
  ),
  Info: o(
    [
      { json: 'max_clients', js: 'max_clients', typ: 0 },
      { json: 'max_players', js: 'max_players', typ: 0 },
      { json: 'passworded', js: 'passworded', typ: true },
      { json: 'game_type', js: 'game_type', typ: '' },
      { json: 'name', js: 'name', typ: '' },
      { json: 'map', js: 'map', typ: r('Map') },
      { json: 'version', js: 'version', typ: '' },
      { json: 'clients', js: 'clients', typ: a(r('Client')) },
      { json: 'client_score_kind', js: 'client_score_kind', typ: u(undefined, r('ClientScoreKind')) },
      { json: 'requires_login', js: 'requires_login', typ: u(undefined, true) },
      { json: 'community', js: 'community', typ: u(undefined, r('Community')) },
      { json: 'altameda_net', js: 'altameda_net', typ: u(undefined, true) }
    ],
    false
  ),
  Client: o(
    [
      { json: 'name', js: 'name', typ: '' },
      { json: 'clan', js: 'clan', typ: '' },
      { json: 'country', js: 'country', typ: 0 },
      { json: 'score', js: 'score', typ: 0 },
      { json: 'is_player', js: 'is_player', typ: true },
      { json: 'skin', js: 'skin', typ: u(undefined, r('Skin')) },
      { json: 'afk', js: 'afk', typ: u(undefined, true) },
      { json: 'team', js: 'team', typ: u(undefined, 0) }
    ],
    false
  ),
  Skin: o(
    [
      { json: 'name', js: 'name', typ: u(undefined, '') },
      { json: 'color_body', js: 'color_body', typ: u(undefined, 0) },
      { json: 'color_feet', js: 'color_feet', typ: u(undefined, 0) },
      { json: 'body', js: 'body', typ: u(undefined, r('Body')) },
      { json: 'marking', js: 'marking', typ: u(undefined, r('Body')) },
      { json: 'decoration', js: 'decoration', typ: u(undefined, r('Body')) },
      { json: 'hands', js: 'hands', typ: u(undefined, r('Body')) },
      { json: 'feet', js: 'feet', typ: u(undefined, r('Body')) },
      { json: 'eyes', js: 'eyes', typ: u(undefined, r('Body')) }
    ],
    false
  ),
  Body: o(
    [
      { json: 'name', js: 'name', typ: r('Name') },
      { json: 'color', js: 'color', typ: u(undefined, 0) }
    ],
    false
  ),
  Community: o(
    [
      { json: 'id', js: 'id', typ: r('ID') },
      { json: 'icon', js: 'icon', typ: '' },
      { json: 'admin', js: 'admin', typ: a('') },
      { json: 'public_key', js: 'public_key', typ: '' },
      { json: 'signature', js: 'signature', typ: '' }
    ],
    false
  ),
  Map: o(
    [
      { json: 'name', js: 'name', typ: '' },
      { json: 'sha256', js: 'sha256', typ: u(undefined, '') },
      { json: 'size', js: 'size', typ: u(undefined, 0) }
    ],
    false
  ),
  ClientScoreKind: ['points', 'score', 'time'],
  Name: ['', 'standard'],
  ID: ['urn:community:kog'],
  Location: ['af', 'as', 'as:cn', 'eu', 'na', 'oc', 'sa']
};

import axios, { AxiosError, AxiosResponse } from 'axios';
import { DDNetError } from './util.js';

/**
 * Makes a request to the master server.
 *
 * @see
 * https://master1.ddnet.org/ddnet/15/servers.json
 */
export async function makeMasterRequest(masterSrv?: string): Promise<object | DDNetError> {
  const url = masterSrv ?? `https://master1.ddnet.org/ddnet/15/servers.json`;

  const response = await axios
    .get<object | string, AxiosResponse<object | string>>(url, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    .catch((err: AxiosError) => new DDNetError(err.cause?.message, err));

  if (response instanceof DDNetError) return response;

  const data = response.data;

  if (typeof data === 'string') return new DDNetError(`Invalid response!`, data);

  return data;
}
