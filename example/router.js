import form from "./templates/form";

const readFile = (FileReader, file) =>
  new Promise(resolve => {
    if (typeof file === "string") {
      return resolve(file);
    }
    const fr = new FileReader();
    fr.addEventListener("load", ev => {
      resolve(ev.target.result);
    });

    fr.readAsText(file);
  });

export default FileReader => (route, method) =>
  ({
    "/": () => ({ body: form, scripts: ["form.js"] }),
    "/submit":
      method === "POST"
        ? data =>
            readFile(FileReader, data.get("file")).then(file => ({
              redirect: "/submit?name=" + data.get("name") + "&text=" + file
            }))
        : data => ({ body: (data.get("name") || "").toUpperCase() })
  }[route]);
