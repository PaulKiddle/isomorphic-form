const parse = require("./server");
const MockReq = require("mock-req");

test("It parses form fields", () => {
  const get = new MockReq({
    method: "GET",
    url: "/test?a=1.1&a=1.2&b=2"
  });
  const postUrlEnc = new MockReq({
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
  postUrlEnc.write("a=1.1&a=1.2&b=2");
  postUrlEnc.end();

  const boundary = 123456;
  const clrf = "\r\n";
  const postMultipart = new MockReq({
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`
    }
  });
  postMultipart.write(
    [
      `--${boundary}`,
      `Content-Disposition: form-data; name="a"`,
      ``,
      `1.1`,
      `--${boundary}`,
      `Content-Disposition: form-data; name="a"`,
      ``,
      `1.2`,
      `--${boundary}`,
      `Content-Disposition: form-data; name="b"`,
      ``,
      `2`,
      `--${boundary}--`,
      ""
    ].join(clrf)
  );
  postMultipart.end();

  return Promise.all([get, postUrlEnc, postMultipart].map(parse)).then(
    buckets => {
      buckets.forEach(bucket =>
        expect(bucket.toString()).toEqual("?a=1.1&a=1.2&b=2")
      );
    }
  );
});
