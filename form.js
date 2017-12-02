import collect from "./collect";

export default callback => form => {
  let submitter = null;

  const doCollect = e => {
    const data = collect(form, submitter);

    if (callback(data, form.method, new Url(form.action)) !== false) {
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
