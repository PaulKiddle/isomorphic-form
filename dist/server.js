'use strict';

var fdp = FormData =>
  class extends FormData {
    static fromString(string) {
      const fd = new this();

      const fields = string
        .replace(/^\?/, "")
        .split("&")
        .map(seg => seg.split("=").map(decodeURIComponent));

      fields.forEach(([key, value]) => {
        fd.append(key, value);
      });

      return fd;
    }

    constructor(form) {
      super(form);
    }

    toJSON(fd) {
      return Array.from(this.entries());
    }

    toString(fd) {
      return (
        "?" +
        this.toJSON()
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&")
      );
    }
  };

const Busboy = require("busboy");
const Url = require("url");
const { JSDOM } = require("jsdom");
const { PassThrough } = require("stream");
const window = new JSDOM().window;
const File = window.File;
const FormData = fdp(window.FormData);

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
