# Isomorphic Form

Many modern web-apps combine javascript and form controls to process user input
within the browser. This is all well and good, but what if your code breaks or
your user is on an unsupported browser?

Wouldn't it be great if you could gather your form data either through
javascript or through traditional form submission, and only write the code to
process it once?

**Isomorphic Form** takes care of this for you. Once it's set up it will send
submitted form data to your router, and you don't need to care whether that data
came from an HTTP submission or from a javascript `submit` event.

Benefits of this:

* Support old browsers without supporting their old javascript
* Do less transpilation
* Put IE11 out of your mind

## Status

This project is in working order, but it's not pretty and the API may not be
stable. The main things left before publishing `v1.0.0` are to improve the tests
and documentation. Help with road testing and improvements would be greatly
appreciated!

### Name

I'm not sure the name `isomorphic-form` is a great idea, but `universal-form`
and `universal-form-data` were taken and I'm not feeling very creative.

## How to use

The package contains two functions, one for the client and one for the server,
who expose the form data as an instance of a [FormData][1] subclass.

Once you have this data, along with the form method (GET or POST) and the action
(the destination url) you can pass it to your universal router or other code to
handle it. You no longer have to care if your code is running on client or
server.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData

The FormData sublcass has a `toString` method which returns the data as a query
string in case you want to do something like append it to a url. It also has a
`toJSON` method and a `fromString` static method.

On the server, FormData is from JSDOM. On the client it's the native
implementation.

```bash
npm install --save isomorphic-form
```

### In the browser

```javascript
const isoForm = require("isomorphic-form/dist/form");

const onSubmit = (data, method, action) => {
  // This is where you pass the data to your router
};

const formEl = document.querySelector("form.myForm");

// This sets up the listeners and plugs in your callback
const remover = isoForm(onSubmit)(formEl);

// When you're ready to remove the listeners:
remover();
```

### On the server

```javascript
const app = require("express")();
const parseFormData = require("isomorphic-form/dist/server");

// Make sure you're not using any form-data body-parser plugins before here
app.use("*", async (req, res) => {
  const data = await parseFormData(req);
  const method = req.method;
  const action = req.originalUrl;

  // This is where you pass the data to your router.
});
```
