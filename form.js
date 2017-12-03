import collect from "./collect";
import history from "./history";

export default (callback = history) => form => {
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
