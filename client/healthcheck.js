// Docker HEALTHCHECK script for the ShopSmart client container.
// Exits 0 if the app responds with any non-error HTTP status, otherwise exits 1.
'use strict';
require('http')
  .get('http://localhost:3000', (res) => {
    process.exit(res.statusCode < 400 ? 0 : 1);
  })
  .on('error', () => process.exit(1));
