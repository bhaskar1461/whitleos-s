const configuredApiBase =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_BACKEND_ORIGIN ||
  '';

const apiBase = configuredApiBase.replace(/\/+$/, '');
const URL_FALLBACK_ORIGIN = 'http://localhost';

function normalizePath(path) {
  if (typeof path !== 'string') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function getPathname(value) {
  if (!value) return '';
  try {
    return new URL(value, URL_FALLBACK_ORIGIN).pathname.replace(/\/+$/, '');
  } catch (_err) {
    return '';
  }
}

export function buildBackendUrl(path) {
  if (typeof path === 'string' && /^https?:\/\//i.test(path)) return path;
  let normalizedPath = normalizePath(path);
  const basePathname = getPathname(apiBase).toLowerCase();
  const pathStartsWithApi = /^\/api(?:\/|$)/i.test(normalizedPath);

  // Avoid /api/api/* when API base already includes an /api suffix.
  if (basePathname.endsWith('/api') && pathStartsWithApi) {
    normalizedPath = normalizedPath.replace(/^\/api(?=\/|$)/i, '') || '/';
  }

  if (!apiBase) return normalizedPath;
  return `${apiBase}${normalizedPath}`;
}

export function apiFetch(path, options = {}) {
  const requestOptions = { ...options, credentials: options.credentials || 'include' };
  return fetch(buildBackendUrl(path), requestOptions);
}
