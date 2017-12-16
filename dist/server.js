'use strict';

const hasKey = key => ([k]) => k === key;
const notKey = key => ([k]) => k !== key;
const hasPair = (key, val) => ([k, v]) => k === key && v == val;

class FormData {
  constructor(fields = []) {
    if (Array.isArray(fields)) {
      this.fields = fields;
      return;
    }

    if (typeof fields === "string") {
      return FormData.fromString(fields);
    }

    if (typeof fields === "object") {
      return FormData.fromObject(fields);
    }

    throw new TypeError(
      `FormData expects array, string or object, not ${typeof fields}`
    );
  }

  static fromString(string) {
    const fields = string
      .replace(/^\?/, "")
      .split("&")
      .map(seg => seg.split("=").map(decodeURIComponent));
    return new FormData(fields);
  }

  static fromObject(object) {
    return new FormData(Object.entries(object));
  }

  append(key, value) {
    this.fields.push([key, value]);
  }

  get(key) {
    const entry = this.fields.find(hasKey(key));
    return entry && entry[1];
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

const Busboy = require("busboy");
const Url = require("url");
const File = require("file-api").File;
const { PassThrough } = require("stream");

var server = req => {
  if (req.method === "GET") {
    const { query } = Url.parse(req.url);
    return Promise.resolve(query ? FormData.fromString(query) : new FormData());
  } else if (req.method === "POST") {
    const bucket = new FormData();
    const busboy = new Busboy({ headers: req.headers });
    const promise = new Promise(resolve =>
      busboy.on("finish", () => {
        resolve(bucket);
      })
    );

    busboy.on("field", (name, value) => {
      bucket.append(name, value);
    });

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const stream = new PassThrough();
      file.pipe(stream);
      bucket.append(fieldname, new File({ name: filename, stream }));
    });

    req.pipe(busboy);

    return promise;
  }

  return null;
};

module.exports = server;
