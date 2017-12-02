const hasKey = key => ([k]) => k === key;
const notKey = key => ([k]) => k !== key;
const hasPair = (key, val) => ([k, v]) => k === key && v == val;

export default class Query {
  constructor(fields = []) {
    if (Array.isArray(fields)) {
      this.fields = fields;
      return;
    }

    if (typeof fields === "string") {
      return Query.fromString(fields);
    }

    if (typeof fields === "object") {
      return Query.fromObject(fields);
    }

    throw new TypeError(
      `Query expects array, string or object, not ${typeof fields}`
    );
  }

  static fromString(string) {
    const fields = string
      .replace(/^\?/, "")
      .split("&")
      .map(seg => seg.split("=").map(decodeURIComponent));
    return new Query(fields);
  }

  static fromObject(object) {
    return new Query(Object.entries(object));
  }

  append(key, value) {
    this.fields.push([key, value]);
  }

  get(key) {
    return this.fields.find(hasKey(key))[1];
  }

  getAll(key) {
    return this.fields.filter(hasKey(key)).map(f => f[0]);
  }

  delete(key) {
    this.fields = this.fields.filter(notKey(key));
  }

  entries() {
    return this.fields.entries();
  }

  has(key, value) {
    return this.fields.some(hasPair(key, value));
  }

  set(key, [...values]) {
    this.delete(key);
    this.fields.concat(values.map(v => [key, v]));
  }

  [Symbol.iterator]() {
    return this.fields[Symbol.iterator]();
  }

  toString() {
    return (
      "?" +
      this.fields
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&")
    );
  }

  toJSON() {
    return this.fields;
  }
}
