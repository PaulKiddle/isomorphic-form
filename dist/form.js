'use strict';

const hasKey = key => ([k]) => k === key;
const notKey = key => ([k]) => k !== key;
const hasPair = (key, val) => ([k, v]) => k === key && v == val;

class FormData {
  constructor(fields = []) {
    if (Array.isArray(fields)) {
      this.fields = fields;
      return;
    }

    if (typeof fields === "string") {
      return FormData.fromString(fields);
    }

    if (typeof fields === "object") {
      return FormData.fromObject(fields);
    }

    throw new TypeError(
      `FormData expects array, string or object, not ${typeof fields}`
    );
  }

  static fromString(string) {
    const fields = string
      .replace(/^\?/, "")
      .split("&")
      .map(seg => seg.split("=").map(decodeURIComponent));
    return new FormData(fields);
  }

  static fromObject(object) {
    return new FormData(Object.entries(object));
  }

  append(key, value) {
    this.fields.push([key, value]);
  }

  get(key) {
    const entry = this.fields.find(hasKey(key));
    return entry && entry[1];
  }

  getAll(key) {
    return this.fields.filter(hasKey(key)).map(f => f[0]);
  }

  delete(key) {
    this.fields = this.fields.filter(notKey(key));
  }

  entries() {
    return this.fields.entries();
  }

  has(key, value) {
    return this.fields.some(hasPair(key, value));
  }

  set(key, [...values]) {
    this.delete(key);
    this.fields.concat(values.map(v => [key, v]));
  }

  [Symbol.iterator]() {
    return this.fields[Symbol.iterator]();
  }

  toString() {
    return (
      "?" +
      this.fields
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&")
    );
  }

  toJSON() {
    return this.fields;
  }
}

const isButton = el => /^button|submit|image$/.test(el.type);
const closest = (el, elName) => {
  while (el && el.nodeName.toLowerCase() !== elName) el = el.parentNode;
  return el;
};

function collect(form, submitter = {}) {
  const data = new FormData();
  const encType = submitter.formEnctype || form.enctype;
  const method = submitter.formMethod || form.method;
  const getFile = file =>
    method === "post" && encType === "multipart/form-data" ? file : file.name;

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
        Array.from(field.files).forEach(file =>
          data.append(name, getFile(file))
        );
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

const historyCb = (data, method, action) => {
  if (action.origin !== new URL(document.documentURI).origin) {
    return false;
  }

  const state =
    method === "post" ? { method: "POST", body: data.toJSON() } : {};
  if (method === "get") {
    action.search = data.toString();
  }

  history.pushState(state, "", action.toString());

  window.dispatchEvent(new PopStateEvent("popstate", { state }));
};

var form = (callback = historyCb) => form => {
  let submitter = null;

  const doCollect = e => {
    const data = collect(form, submitter);

    if (
      callback(
        data,
        submitter.formMethod || form.method,
        new URL(
          submitter.getAttribute("formaction") || form.action,
          window.location
        )
      ) !== false
    ) {
      e.preventDefault();
    }
  };

  const captureSubmitter = e => {
    if (e.target.type === "submit") {
      submitter = e.target;
      setTimeout(() => {
        submitter = null;
      }, 0);
    }
  };

  form.ownerDocument.addEventListener("click", captureSubmitter);
  form.addEventListener("submit", doCollect);

  return () => {
    form.ownerDocument.removeEventListener("click", captureSubmitter);
    form.removeEventListener("submit", doCollect);
  };
};

module.exports = form;
