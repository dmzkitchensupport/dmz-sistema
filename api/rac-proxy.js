// /api/rac-proxy.js — Proxy transparente hacia dmz-audit.netlify.app
// Resuelve el bloqueo CORS: el HTML llama a /api/rac-proxy/<path>
// y esta función lo reenvía al backend con el Origin correcto.

const https = require('https');
const http  = require('http');

const BACKEND = 'https://dmz-audit.netlify.app/.netlify/functions';
const ALLOWED_ORIGIN = 'https://mariozumaran.github.io';

module.exports = async (req, res) => {
  // Extraer el sub-path: /api/rac-proxy/auth-login → /auth-login
  const subPath = req.url.replace(/^\/api\/rac-proxy/, '') || '/';

  // CORS para el cliente Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, X-Client-GPS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Leer body
  const bodyChunks = [];
  for await (const chunk of req) bodyChunks.push(chunk);
  const body = Buffer.concat(bodyChunks);

  // Headers a reenviar
  const headers = {
    'Content-Type':  req.headers['content-type'] || 'application/json',
    'Authorization': req.headers['authorization'] || '',
    'Origin':        ALLOWED_ORIGIN,
    'Content-Length': body.length,
  };
  if (req.headers['cookie']) headers['Cookie'] = req.headers['cookie'];

  const targetUrl = new URL(BACKEND + subPath);

  const options = {
    hostname: targetUrl.hostname,
    path:     targetUrl.pathname + (targetUrl.search || ''),
    method:   req.method,
    headers,
  };

  await new Promise((resolve, reject) => {
    const proto = targetUrl.protocol === 'https:' ? https : http;
    const proxyReq = proto.request(options, (proxyRes) => {
      // Reenviar cookies Set-Cookie al cliente
      const sc = proxyRes.headers['set-cookie'];
      if (sc) res.setHeader('Set-Cookie', sc);

      res.status(proxyRes.statusCode);
      proxyRes.pipe(res, { end: true });
      proxyRes.on('end', resolve);
    });
    proxyReq.on('error', (e) => {
      res.status(502).json({ error: 'Proxy error', detail: e.message });
      resolve();
    });
    if (body.length) proxyReq.write(body);
    proxyReq.end();
  });
};
