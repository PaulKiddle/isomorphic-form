import form from "./templates/form";

export default (route, method) =>
  ({
    "/": () => ({ body: form, scripts: ["form.js"] }),
    "/submit":
      method === "POST"
        ? data => ({
            redirect: "/submit?name=" + data.get("name") + data.get("name")
          })
        : data => ({ body: (data.get("name") || "").toUpperCase() })
  }[route]);
