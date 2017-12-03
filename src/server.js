import FormData from "./form-data";
const Busboy = require("busboy");
const Url = require("url");
const File = require("file-api").File;
const { PassThrough } = require("stream");

export default req => {
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
