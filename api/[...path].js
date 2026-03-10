const app = require('../server/index');

function stripApiPrefix(pathname) {
  return pathname.startsWith('/api/') ? pathname.slice(4) || '/' : pathname;
}

module.exports = (req, res) => {
  const originalUrl = String(req.url || '/');
  const qIndex = originalUrl.indexOf('?');
  const pathname = qIndex >= 0 ? originalUrl.slice(0, qIndex) : originalUrl;
  const query = qIndex >= 0 ? originalUrl.slice(qIndex) : '';

  const rewrittenBackendPath =
    pathname === '/api/logout' ||
    pathname === '/api/webhook' ||
    pathname === '/api/healthz' ||
    pathname.startsWith('/api/auth/github') ||
    pathname.startsWith('/api/auth/google');

  if (rewrittenBackendPath) {
    req.url = `${stripApiPrefix(pathname)}${query}`;
    return app(req, res);
  }

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
