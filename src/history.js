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

export default historyCb;
