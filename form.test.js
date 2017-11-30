const submit = require("./form");

global.Url = require("url").URL;

test("it adds a callback", () => {
  const jcb = jest.fn();
  const cb = data => jcb(data.toString());
  const preventDefault = jest.fn();
  const form = document.createElement("form");
  form.innerHTML = `
    <button name='a' value=1>1</button>
    <input name=b value=2>
    <button name='c' value=3>3</button>
  `;
  form.method = "GET";
  form.action = "http://example.com";

  document.body.appendChild(form);

  const remover = submit(cb)(form);

  const dispatchSubmit = target => {
    target.dispatchEvent(new Event("click", { bubbles: true }));
    return !form.dispatchEvent(new Event("submit", { cancelable: true }));
  };

  let prevented = dispatchSubmit(form.elements.a);

  expect(jcb).toHaveBeenCalledWith("?a=1&b=2");
  expect(prevented).toBe(true);

  jcb.mockReset();

  remover();

  prevented = dispatchSubmit(form.elements.c);

  expect(jcb).not.toHaveBeenCalled();
  expect(prevented).toBe(false);
});
