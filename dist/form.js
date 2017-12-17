'use strict';

var df = FormData =>
  class extends FormData {
    static fromString(string) {
      const fd = new this();

      const fields = string
        .replace(/^\?/, "")
        .split("&")
        .map(seg => seg.split("=").map(decodeURIComponent));

      fields.forEach(([key, value]) => {
        fd.append(key, value);
      });

      return fd;
    }

    constructor(form) {
      super(form);
    }

    toJSON(fd) {
      return Array.from(this.entries());
    }

    toString(fd) {
      return (
        "?" +
        this.toJSON()
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&")
      );
    }
  };

const FormDataPlus = df(FormData);

function collect(
  form,
  submitter = null,
  coords = { x: 0, y: 0 }
) {
  const data = new FormDataPlus(form);

  if (submitter) {
    if (submitter.type === "image") {
      const name = submitter.name ? submitter.name + "." : "";

      data.append(name + "x", coords.x.toString());
      data.append(name + "y", coords.y.toString());
    } else {
      data.append(submitter.name, submitter.value);
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
    const { left, top } = submitter.getBoundingClientRect();
    const data = collect(form, submitter, {
      x: e.clientX - left,
      y: e.clientY - top
    });

    const cbResult = callback(
      data,
      submitter.formMethod || form.method,
      new URL(
        submitter.getAttribute("formaction") || form.action,
        window.location
      )
    );

    if (cbResult !== false) {
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
