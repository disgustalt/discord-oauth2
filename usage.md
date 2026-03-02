Here's some usage examples for the code :)

### Hono
```js
const handle = requir('./hono.cjs');
/*
  OR
  import handle from './hono.mjs';
*/

app.get('/oauth-fallback', async (c) => {
  return await handle(c);
});
```
