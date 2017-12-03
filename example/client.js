import router from "./router";
import FormData from "../index";

window.addEventListener("popstate", e => {
  const state = e.state || {};
  const route = router(location.pathname, state.method)(
    new FormData(state.method === "POST" ? state.body : location.search)
  );

  if (route.redirect) {
    history.replaceState({}, "", route.redirect);
    dispatchEvent(new PopStateEvent("popstate", { state: {} }));
    return;
  }

  document.body.innerHTML = route.body;
  if (route.scripts) {
    route.scripts.forEach(s => {
      const el = document.createElement("script");
      el.setAttribute("src", s);
      document.body.appendChild(el);
    });
  }
});
