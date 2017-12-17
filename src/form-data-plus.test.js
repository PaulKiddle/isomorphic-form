import fdp from "./form-data-plus";

const FormDataPlus = fdp(FormData);

test("It parses query strings", () => {
  const q = FormDataPlus.fromString("?a=b");
  expect(q.get("a")).toEqual("b");
});

test("It builds query strings", () => {
  const q = new FormDataPlus();
  q.append("c", "d");
  expect(q.toString()).toEqual("?c=d");
});
