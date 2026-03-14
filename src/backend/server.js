// server.js — Custom CAP bootstrap
//
// CAP's built-in dev CORS doesn't include x-csrf-token in
// Access-Control-Allow-Headers, which ODataModel v4 sends on every
// preflight. This middleware explicitly allows it so Stage 5/6
// can connect from a different port (e.g. localhost:3000 → 4004).

const cds = require('@sap/cds');

cds.on('bootstrap', (app) => {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });
});

module.exports = cds.server;
