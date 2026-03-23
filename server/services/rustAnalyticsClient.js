const DEFAULT_TIMEOUT_MS = Math.min(15000, Math.max(500, Number(process.env.RUST_ANALYTICS_TIMEOUT_MS) || 3000));

function getBaseUrl() {
  return String(process.env.RUST_ANALYTICS_BASE_URL || '').trim().replace(/\/+$/, '');
}

function getSharedToken() {
  return String(process.env.RUST_ANALYTICS_TOKEN || '').trim();
}

function hasRustAnalyticsConfig() {
  return Boolean(getBaseUrl());
}

async function parseErrorBody(response) {
  const text = await response.text();
  if (!text) return '';

  try {
    const parsed = JSON.parse(text);
    return parsed.message || parsed.error || text;
  } catch (_err) {
    return text;
  }
}

async function fetchRustAnalytics({ limit = 20, windowDays = 14 } = {}) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    const error = new Error('Rust analytics service is not configured.');
    error.code = 'RUST_ANALYTICS_NOT_CONFIGURED';
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const url = new URL(`${baseUrl}/analytics`);
    url.searchParams.set('limit', String(Math.min(100, Math.max(1, Number(limit) || 20))));
    url.searchParams.set('windowDays', String(Math.min(90, Math.max(1, Number(windowDays) || 14))));

    const headers = { Accept: 'application/json' };
    const sharedToken = getSharedToken();
    if (sharedToken) headers['x-analytics-token'] = sharedToken;

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(await parseErrorBody(response));
      error.code = 'RUST_ANALYTICS_HTTP_ERROR';
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`Rust analytics request timed out after ${DEFAULT_TIMEOUT_MS}ms.`);
      timeoutError.code = 'RUST_ANALYTICS_TIMEOUT';
      throw timeoutError;
    }

    if (!err.code) err.code = 'RUST_ANALYTICS_REQUEST_FAILED';
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { fetchRustAnalytics, hasRustAnalyticsConfig };
