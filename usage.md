Here's some usage examples for the code :)

### Hono
```javascript
const handle = require('./hono.cjs');
/*
  OR
  import handle from './hono.mjs';
*/

app.get('/oauth-fallback', async (c) => {
  return await handle(c);
});
```
