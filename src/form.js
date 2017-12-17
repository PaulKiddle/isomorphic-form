import collect from "./collect";
import history from "./history";

export default (callback = history) => form => {
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
