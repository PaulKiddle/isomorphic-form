import parse from "../server";
import resolve from "./router";
import index from "./templates/index";

const path = require("path");
const fs = require("fs");
const express = require("express");
const rollup = require("rollup");
const app = express();

app.use((req, res, next) => {
  const route = resolve(req.path, req.method);

  if (!route) {
    return next();
  }

  Promise.resolve(parse(req)).then(data => {
    const page = route(data);

    if (page.redirect) {
      res.redirect(page.redirect);
      return;
    }

    res.send(index(page));
  });
});

const roll = file =>
  rollup
    .rollup({ input: require.resolve(file) })
    .then(b =>
      b.generate({ format: "iife", name: file.replace(/[^a-zA-Z]/g, "") })
    )
    .then(o => o.code);

app.use("/client.js", (req, res) => {
  roll("./client").then(code => {
    res.send(code);
  });
});

app.use("/form.js", (req, res) => {
  roll("../form").then(code => {
    res.send(
      code +
        `
      form()(document.forms[0])`
    );
  });
});

app.listen(3000);
