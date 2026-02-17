const configuredApiBase =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_BACKEND_ORIGIN ||
  '';

const apiBase = configuredApiBase.replace(/\/+$/, '');

function normalizePath(path) {
  if (typeof path !== 'string') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function buildBackendUrl(path) {
  if (typeof path === 'string' && /^https?:\/\//i.test(path)) return path;
  const normalizedPath = normalizePath(path);
  if (!apiBase) return normalizedPath;
  return `${apiBase}${normalizedPath}`;
}

export function apiFetch(path, options = {}) {
  const requestOptions = { ...options, credentials: options.credentials || 'include' };
  return fetch(buildBackendUrl(path), requestOptions);
}
