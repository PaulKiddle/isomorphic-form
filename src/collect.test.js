import collect from "./collect.js";

test("Collect returns query", () => {
  const form = document.createElement("form");

  expect(collect(form).toString()).toEqual("?");
});

test("Collects elements", () => {
  const form = document.createElement("form");
  form.innerHTML = `
  <datalist><input name=xa value=x1></datalist>
  <input name=xb disabled value=x2>
  <input type=radio name=xc value=x3>
  <input type=checkbox name=xd value=x4>
  <input value=x5>
  <input type=button name=xf value=x6>
  <input type=image>
  <input type=image name=xh>

  <select name=b>
    <option value=2 selected>2
    <option value=x2>x2
  </select>
  <select name=c>
    <option selected>3
    <option>x3
  </select>
  <select multiple name=d>
    <option selected>4.1
    <option selected>4.2
    ${"" /*<option selected disabled>x4*/}
  </select>
  <input type=radio name=e value=5 checked>
  <input type=radio name=f checked>
  <input type=checkbox name=g value=7 checked>
  <input type=checkbox name=h checked>
  <input type=file name=i>
  <input name=j value=10 dirname=k dir=ltr>
  --
  <textarea name=l>12</textarea>
  <input name=m value=rtl>
  `;
  // Bug?
  //  <textarea name=l dirname=m dir=rtl>12</textarea>

  expect(collect(form).toJSON()).toMatchSnapshot();
});

test("it includes submitter value", () => {
  const form = document.createElement("form");
  const btn = document.createElement("button");
  btn.setAttribute("name", "a");
  btn.setAttribute("value", "1");

  form.appendChild(btn);

  expect(collect(form, btn).toJSON()).toMatchSnapshot();
});
