rm -r dist
rollup -f cjs -o dist/form.js src/form
rollup -f cjs -o dist/server.js src/server
