function parseTimestamp(value) {
  if (!value) return NaN;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : NaN;
}

function normalizeProvider(value) {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : 'unknown';
}

function countUsersActiveSince(users, sinceMs) {
  return users.filter((user) => {
    const lastSeenMs = parseTimestamp(user.lastSeenAt || user.lastLoginAt || user.firstSeenAt);
    return Number.isFinite(lastSeenMs) && lastSeenMs >= sinceMs;
  }).length;
}

function buildLoginSeries(loginsByDate, days) {
  const now = new Date();
  const result = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - i);
    const key = day.toISOString().slice(0, 10);
    result.push({ date: key, logins: Number(loginsByDate[key] || 0) });
  }

  return result;
}

function userLabel(user) {
  if (!user) return 'Unknown user';
  return user.username || user.email || user.id || 'Unknown user';
}

function buildRecentActivity(data, limit) {
  const users = Array.isArray(data.users) ? data.users : [];
  const usersById = new Map(users.map((user) => [user.id, user]));
  const events = [];

  const pushEvent = ({ at, kind, collection, uid, provider, summary }) => {
    const timestamp = parseTimestamp(at);
    if (!Number.isFinite(timestamp)) return;

    events.push({
      at: new Date(timestamp).toISOString(),
      kind,
      collection,
      userId: uid || null,
      provider: provider || null,
      summary,
      sortAt: timestamp,
    });
  };

  users.forEach((user) => {
    if (!user.lastLoginAt) return;
    pushEvent({
      at: user.lastLoginAt,
      kind: 'login',
      collection: 'users',
      uid: user.id,
      provider: normalizeProvider(user.provider),
      summary: `${userLabel(user)} logged in via ${normalizeProvider(user.provider)}`,
    });
  });

  (data.connections || []).forEach((item) => {
    const user = usersById.get(item.uid);
    pushEvent({
      at: item.updatedAt,
      kind: 'connection_refresh',
      collection: 'connections',
      uid: item.uid,
      provider: item.provider || null,
      summary: `${userLabel(user)} refreshed ${item.provider || 'a provider'} connection`,
    });
  });

  (data.journal || []).forEach((item) => {
    const user = usersById.get(item.uid);
    pushEvent({
      at: item.created || item.date,
      kind: 'journal_entry',
      collection: 'journal',
      uid: item.uid,
      provider: user ? normalizeProvider(user.provider) : null,
      summary: `${userLabel(user)} wrote "${item.title || 'Journal entry'}"`,
    });
  });

  (data.meals || []).forEach((item) => {
    const user = usersById.get(item.uid);
    const calories = Number.isFinite(Number(item.calories)) ? `${Number(item.calories)} kcal` : 'meal logged';
    pushEvent({
      at: item.created || item.date,
      kind: 'meal_logged',
      collection: 'meals',
      uid: item.uid,
      provider: user ? normalizeProvider(user.provider) : null,
      summary: `${userLabel(user)} logged ${item.name || 'a meal'} (${calories})`,
    });
  });

  (data.workouts || []).forEach((item) => {
    const user = usersById.get(item.uid);
    const duration = Number.isFinite(Number(item.duration)) ? `${Number(item.duration)} min` : 'duration n/a';
    pushEvent({
      at: item.created || item.date,
      kind: 'workout_logged',
      collection: 'workouts',
      uid: item.uid,
      provider: user ? normalizeProvider(user.provider) : null,
      summary: `${userLabel(user)} logged ${item.exercise || 'a workout'} (${duration})`,
    });
  });

  (data.steps || []).forEach((item) => {
    const user = usersById.get(item.uid);
    const count = Number.isFinite(Number(item.count)) ? `${Number(item.count)} steps` : 'steps logged';
    pushEvent({
      at: item.created || item.date,
      kind: 'steps_logged',
      collection: 'steps',
      uid: item.uid,
      provider: user ? normalizeProvider(user.provider) : null,
      summary: `${userLabel(user)} recorded ${count}`,
    });
  });

  (data.healthData || []).forEach((item) => {
    const user = usersById.get(item.uid);
    pushEvent({
      at: item.created || item.date,
      kind: 'health_sync',
      collection: 'healthData',
      uid: item.uid,
      provider: user ? normalizeProvider(user.provider) : null,
      summary: `${userLabel(user)} synced health data`,
    });
  });

  return events
    .sort((a, b) => b.sortAt - a.sortAt)
    .slice(0, limit)
    .map(({ sortAt, ...event }) => event);
}

function buildAnalyticsPayload(data = {}, options = {}) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const users = Array.isArray(data.users) ? data.users : [];
  const loginsByDate = data.analytics?.loginsByDate && typeof data.analytics.loginsByDate === 'object'
    ? data.analytics.loginsByDate
    : {};
  const windowDays = Math.min(90, Math.max(1, Number(options.windowDays) || 14));
  const recentActivityLimit = Math.min(100, Math.max(1, Number(options.recentActivityLimit) || 20));

  const usersByProvider = users.reduce((acc, user) => {
    const provider = normalizeProvider(user.provider);
    acc[provider] = Number(acc[provider] || 0) + 1;
    return acc;
  }, {});

  const loginCountsByProvider = users.reduce((acc, user) => {
    const provider = normalizeProvider(user.provider);
    acc[provider] = Number(acc[provider] || 0) + Math.max(0, Number(user.loginCount) || 0);
    return acc;
  }, {});

  const totalLogins = Object.values(loginCountsByProvider).reduce((sum, value) => sum + Number(value || 0), 0);
  const newUsersLast7d = users.filter((user) => {
    const firstSeen = parseTimestamp(user.firstSeenAt);
    return Number.isFinite(firstSeen) && firstSeen >= now - 7 * oneDay;
  }).length;

  return {
    generatedAt: new Date().toISOString(),
    source: {
      service: options.service || 'node-express',
      mode: options.mode || 'fallback',
      storage: options.storage || 'unknown',
      stateCollection: options.stateCollection || null,
      stateDocId: options.stateDocId || null,
      proxiedBy: options.proxiedBy || null,
      fallbackReason: options.fallbackReason || null,
    },
    users: {
      total: users.length,
      active24h: countUsersActiveSince(users, now - oneDay),
      active7d: countUsersActiveSince(users, now - 7 * oneDay),
      active30d: countUsersActiveSince(users, now - 30 * oneDay),
      newUsersLast7d,
      totalLogins,
      byProvider: usersByProvider,
    },
    logins: {
      total: totalLogins,
      today: Number(loginsByDate[new Date().toISOString().slice(0, 10)] || 0),
      byProvider: loginCountsByProvider,
      windowDays,
      series: buildLoginSeries(loginsByDate, windowDays),
    },
    records: {
      journal: (data.journal || []).length,
      meals: (data.meals || []).length,
      workouts: (data.workouts || []).length,
      steps: (data.steps || []).length,
      healthData: (data.healthData || []).length,
      connections: (data.connections || []).length,
      webhooks: (data.webhooks || []).length,
    },
    recentActivity: buildRecentActivity(data, recentActivityLimit),
  };
}

module.exports = { buildAnalyticsPayload };
