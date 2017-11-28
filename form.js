const collect = require("./collect");

module.exports = callback => form => {
  let submitter = null;

  const doCollect = e => {
    const data = collect(form, submitter);
    callback(data);
    e.preventDefault();
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
