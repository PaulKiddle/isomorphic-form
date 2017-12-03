import FormData from "./form-data";

test("It parses query strings", () => {
  const q = new FormData("?a=b");
  expect(q.get("a")).toEqual("b");
});

test("It builds query strings", () => {
  const q = new FormData();
  q.append("c", "d");
  expect(q.toString()).toEqual("?c=d");
});
