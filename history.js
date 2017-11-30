const historyCb = (data, method, action) => {
  if (action.origin !== new URL(document.documentURI).origin) {
    return false;
  }

  if (method === "POST") {
    history.pushState({ method: "POST", body: data }, "", action.toString());
  } else {
    action.search = data.toString();
    history.pushState({}, "", action.toString());
  }
};
