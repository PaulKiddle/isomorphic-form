import df from "./form-data-plus";

const FormDataPlus = df(FormData);

export default function collect(
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
