# Universal Form

Many modern web-apps combine javascript and form controls to process user input
within the browser. This is all well and good, but what if your code breaks or
your user is on an unsupported browser?

Wouldn't it be great if you could gather your form data either through
javascript or through traditional form submission, and only write the code to
process it once?

**Universal Form** takes care of this for you. Once it's set up it will send
submitted form data to your router, and you don't need to care whether that data
came from an HTTP submission or from a javascript `submit` event.

This library plays well with others; it doesn't care what frameworks you're
using, just that you have a universal router it can plug into.

## Status

This project is in working order, but it's not pretty and the API is not stable.
As soon as I've ironed out the creases I'll be adding documentations and then
publishing it at `v1.0.0`.
