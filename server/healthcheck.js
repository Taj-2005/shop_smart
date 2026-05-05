// Docker HEALTHCHECK script for the ShopSmart API container.
// Exits 0 if the /api/health endpoint responds with HTTP 200, otherwise exits 1.
'use strict';
require('http')
  .get('http://localhost:4000/api/health', (res) => {
    process.exit(res.statusCode === 200 ? 0 : 1);
  })
  .on('error', () => process.exit(1));
