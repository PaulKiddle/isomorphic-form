const glob = require("glob");
const rollup = require("rollup");
const tape = require("tape");
const { JSDOM, VirtualConsole } = require("jsdom");
const sinon = require("sinon");

const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console, { omitJSDOMErrors: true });
virtualConsole.on("jsdomError", e => {
  if (e.type !== "not implemented") {
    console.error(e);
  }
});
const { document, window, HTMLFormElement } = new JSDOM(
  `<!DOCTYPE html><body></body>`,
  { virtualConsole }
).window;
global.document = document;
global.Event = window.Event;

glob("**/*.test.js", { ignore: "node_modules/**" }, (err, files) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  files.forEach(file => {
    rollup
      .rollup({ input: __dirname + "/" + file })
      .then(b =>
        b.generate({
          format: "cjs"
        })
      )
      .then(({ code }) => {
        tape(file, t => {
          global.test = function(name, code) {
            t.test(name, t => {
              global.jest = {
                fn: () => {
                  const s = sinon.spy();

                  s.mockReset = s.reset;
                  return s;
                }
              };
              global.expect = obj => ({
                toEqual: exp => t.deepEqual(obj, exp),
                toMatchSnapshot: () => {
                  const snapFile =
                    __dirname + "/" + file.replace(/\.js$/, ".snap.json");
                  let shot;
                  try {
                    shot = require(snapFile);
                  } catch (e) {
                    shot = {};
                  }

                  if (name in shot) {
                    t.deepEqual(obj, shot[name]);
                  } else {
                    shot[name] = obj;
                    require("fs").writeFileSync(snapFile, JSON.stringify(shot));
                  }
                },
                toHaveBeenCalledWith: (...args) =>
                  t.ok(obj.calledWith(...args)),
                toHaveBeenCalled: () => t.ok(obj.called()),
                toBe: val => t.equal(obj, val),
                not: {
                  toHaveBeenCalled: () => t.ok(obj.notCalled)
                }
              });
              code();
              t.end();
            });
          };
          eval(code);
        });
      });
  });
});
