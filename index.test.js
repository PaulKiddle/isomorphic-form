import Query from "./index";

test("It parses query strings", () => {
  const q = new Query("?a=b");
  expect(q.get("a")).toEqual("b");
});

test("It builds query strings", () => {
  const q = new Query();
  q.append("c", "d");
  expect(q.toString()).toEqual("?c=d");
});
