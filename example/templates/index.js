export default ({ body, scripts = [] }) => `<!doctype html>
<html>
  <head>
    <title>Example Form</title>
    ${scripts
      .concat("client.js")
      .map(
        s => `
      <script defer src='${s}'></script>`
      )
      .join("\n")}
  </head>
  <body>
    ${body}
  </body>
</html>`;
