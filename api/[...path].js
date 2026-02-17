const app = require('../server/index');

module.exports = (req, res) => {
  const originalUrl = String(req.url || '/');
  const qIndex = originalUrl.indexOf('?');
  const pathname = qIndex >= 0 ? originalUrl.slice(0, qIndex) : originalUrl;
  const query = qIndex >= 0 ? originalUrl.slice(qIndex) : '';

  const isDirectBackendPath =
    pathname === '/' ||
    pathname === '/logout' ||
    pathname === '/webhook' ||
    pathname === '/healthz' ||
    pathname.startsWith('/auth/github') ||
    pathname.startsWith('/auth/google');

  if (!pathname.startsWith('/api/') && !isDirectBackendPath) {
    req.url = `/api${pathname}${query}`;
  }

  return app(req, res);
};
