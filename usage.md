Here's some usage examples for the code :)
 
> [!NOTE]
> This usage example assumes that your main file is in the same directory as the OAuth2 handler files :v
 
## Examples
- [Hono](#hono)
- [Express.js](#expressjs)
  
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
 
### Express.js
```javascript
const handle = require('./express.cjs');
/*
  OR
  import handle from './express.mjs';
*/

app.get('/oauth-fallback', async (req, res) => {
  await handle(req, res);
});
```
