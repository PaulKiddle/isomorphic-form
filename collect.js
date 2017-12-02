import Query from "./index";

const isButton = el => /^button|submit|image$/.test(el.type);
const closest = (el, elName) => {
  while (el && el.nodeName.toLowerCase() !== elName) el = el.parentNode;
  return el;
};

export default function collect(form, submitter) {
  const data = new Query();

  for (let field of form.elements) {
    if (
      closest(field, "datalist") ||
      field.disabled ||
      (isButton(field) && field !== submitter) ||
      (/^(radio|checkbox)$/.test(field.type) && !field.checked) ||
      (field.type !== "image" && !field.name)
    ) {
      continue;
    }

    let { name, type } = field;

    if (field.nodeName.toLowerCase() === "input" && type === "image") {
      name = name ? field.name + "." : "";
      data.append(name + "x", "0");
      data.append(name + "y", "0");
      continue;
    }

    if (/^select-(one|multiple)$/.test(type)) {
      for (let option of field.options) {
        if (option.selected && !option.disabled) {
          data.append(name, option.value);
        }
      }
    } else if (/^(radio|checkbox)$/.test(type)) {
      data.append(name, field.value || "on");
    } else if (type === "file") {
      if (field.files.length) {
        field.files.forEach(file => data.append(name, file));
      } else {
        data.append(name, "");
      }
    } else {
      data.append(name, field.value);
    }

    let dirname;
    if ((dirname = field.getAttribute("dirname"))) {
      data.append(dirname, field.dir === "ltr" ? "ltr" : "rtl");
    }
  }

  return data;
}
