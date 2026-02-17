require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { db } = require('./lowdb');
const { nanoid } = require('nanoid');

let compression = (_req, _res, next) => next();
try {
  compression = require('compression');
} catch (_err) {
  console.warn('[server] compression package not installed, responses will not be gzipped.');
}

const PORT = process.env.API_PORT || process.env.PORT || 4000;
const {
  FRONTEND_URL = 'http://localhost:3000',
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL = 'http://localhost:4000/auth/github/callback',
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL = 'http://localhost:4000/auth/google/callback',
  ADMIN_TOKEN,
  SESSION_SECRET = 'dev_secret_change_me',
  WEBHOOK_SECRET,
} = process.env;

function hasRealCredential(value) {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes('your_')) return false;
  if (normalized.includes('placeholder')) return false;
  return true;
}

const githubOauthConfigured = hasRealCredential(GITHUB_CLIENT_ID) && hasRealCredential(GITHUB_CLIENT_SECRET);
const googleOauthConfigured = hasRealCredential(GOOGLE_CLIENT_ID) && hasRealCredential(GOOGLE_CLIENT_SECRET);

if (!githubOauthConfigured) {
  console.warn('[server] Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET. Set them in environment variables.');
}
if (!googleOauthConfigured) {
  console.warn('[server] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Google Fit sync will be unavailable.');
}
if (!hasRealCredential(ADMIN_TOKEN || '')) {
  console.warn('[server] Missing ADMIN_TOKEN. Admin stats endpoint will be disabled.');
}

let dbInitialized = false;

async function ensureDbReady() {
  if (dbInitialized) return;
  await db.read();
  db.data = db.data || {};
  db.data.journal = Array.isArray(db.data.journal) ? db.data.journal : [];
  db.data.steps = Array.isArray(db.data.steps) ? db.data.steps : [];
  db.data.meals = Array.isArray(db.data.meals) ? db.data.meals : [];
  db.data.workouts = Array.isArray(db.data.workouts) ? db.data.workouts : [];
  db.data.healthData = Array.isArray(db.data.healthData) ? db.data.healthData : [];
  db.data.webhooks = Array.isArray(db.data.webhooks) ? db.data.webhooks : [];
  db.data.connections = Array.isArray(db.data.connections) ? db.data.connections : [];
  db.data.users = Array.isArray(db.data.users) ? db.data.users : [];
  db.data.analytics = db.data.analytics || {};
  db.data.analytics.loginsByDate = db.data.analytics.loginsByDate || {};
  dbInitialized = true;
}

function upsertUserUsage(user, { incrementLogin = false } = {}) {
  if (!user?.id) return false;

  db.data.users = Array.isArray(db.data.users) ? db.data.users : [];
  db.data.analytics = db.data.analytics || {};
  db.data.analytics.loginsByDate = db.data.analytics.loginsByDate || {};

  const nowIso = new Date().toISOString();
  const nowMs = Date.now();
  const normalizedProvider = user.provider || (String(user.id).startsWith('google:') ? 'google' : 'github');

  let changed = false;
  let existing = db.data.users.find((item) => item.id === user.id);
  if (!existing) {
    existing = {
      id: user.id,
      provider: normalizedProvider,
      username: user.username || null,
      email: user.email || null,
      avatar: user.avatar || null,
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
      lastLoginAt: null,
      loginCount: 0,
    };
    db.data.users.push(existing);
    changed = true;
  }

  if (existing.provider !== normalizedProvider) {
    existing.provider = normalizedProvider;
    changed = true;
  }
  if (user.username && existing.username !== user.username) {
    existing.username = user.username;
    changed = true;
  }
  if (user.email && existing.email !== user.email) {
    existing.email = user.email;
    changed = true;
  }
  if (user.avatar && existing.avatar !== user.avatar) {
    existing.avatar = user.avatar;
    changed = true;
  }

  const previousSeenMs = new Date(existing.lastSeenAt || 0).getTime();
  if (!Number.isFinite(previousSeenMs) || nowMs - previousSeenMs > 5 * 60 * 1000) {
    existing.lastSeenAt = nowIso;
    changed = true;
  }

  if (incrementLogin) {
    existing.loginCount = Number(existing.loginCount || 0) + 1;
    existing.lastLoginAt = nowIso;
    existing.lastSeenAt = nowIso;
    const dayKey = nowIso.slice(0, 10);
    db.data.analytics.loginsByDate[dayKey] = Number(db.data.analytics.loginsByDate[dayKey] || 0) + 1;
    changed = true;
  }

  return changed;
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

if (githubOauthConfigured) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
        scope: ['read:user'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = {
            id: String(profile.id),
            username: profile.username,
            avatar: profile.photos?.[0]?.value || '',
            provider: 'github',
          };

          await ensureDbReady();
          const changed = upsertUserUsage(user, { incrementLogin: true });
          if (changed) await db.write();

          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

if (googleOauthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: [
          'profile',
          'email',
          'https://www.googleapis.com/auth/fitness.activity.read',
          'https://www.googleapis.com/auth/fitness.location.read',
        ],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = {
            id: `google:${profile.id}`,
            username: profile.displayName || profile.emails?.[0]?.value || 'Google User',
            avatar: profile.photos?.[0]?.value || '',
            provider: 'google',
            email: profile.emails?.[0]?.value || '',
            accessToken,
            refreshToken: refreshToken || null,
          };

          await ensureDbReady();
          db.data.connections = db.data.connections || [];
          const existing = db.data.connections.find((x) => x.uid === user.id && x.provider === 'google_fit');
          if (existing) {
            existing.accessToken = accessToken;
            existing.refreshToken = refreshToken || existing.refreshToken || null;
            existing.email = user.email;
            existing.username = user.username;
            existing.updatedAt = new Date().toISOString();
          } else {
            db.data.connections.push({
              id: nanoid(),
              uid: user.id,
              provider: 'google_fit',
              email: user.email,
              username: user.username,
              accessToken,
              refreshToken: refreshToken || null,
              updatedAt: new Date().toISOString(),
            });
          }
          upsertUserUsage(user, { incrementLogin: true });
          await db.write();
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.status(401).json({ error: 'unauthorized' });
}

function ensureAdmin(req, res, next) {
  if (!hasRealCredential(ADMIN_TOKEN || '')) {
    return res.status(503).json({
      error: 'admin_not_configured',
      message: 'Set ADMIN_TOKEN in environment variables to enable admin stats.',
    });
  }
  const provided = req.get('x-admin-token');
  if (!provided || provided !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'admin_unauthorized' });
  }
  return next();
}

function parseTimestamp(value) {
  if (!value) return NaN;
  return new Date(value).getTime();
}

function countUsersActiveSince(users, sinceMs) {
  return users.filter((user) => {
    const lastSeenMs = parseTimestamp(user.lastSeenAt || user.lastLoginAt || user.firstSeenAt);
    return Number.isFinite(lastSeenMs) && lastSeenMs >= sinceMs;
  }).length;
}

function buildLoginSeries(loginsByDate, days = 14) {
  const now = new Date();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const day = d.toISOString().slice(0, 10);
    result.push({ date: day, logins: Number(loginsByDate[day] || 0) });
  }
  return result;
}

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    provider: user.provider || 'github',
    email: user.email || null,
  };
}

function getDateOnly(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function getNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeHealthDataPayload(payload = {}) {
  return {
    caloriesBurned: getNumber(payload.caloriesBurned ?? payload.calories_burned, 0),
    exerciseMinutes: getNumber(payload.exerciseMinutes ?? payload.exercise_minutes, 0),
    standHours: getNumber(payload.standHours ?? payload.stand_hours, 0),
    restingHeartRate:
      payload.restingHeartRate ?? payload.resting_heart_rate ?? null,
    respiratoryRate:
      payload.respiratoryRate ?? payload.respiratory_rate ?? null,
    sleepDuration: payload.sleepDuration ?? payload.sleep_duration ?? null,
    sleepQuality: payload.sleepQuality ?? payload.sleep_quality ?? null,
    sleepStages: payload.sleepStages ?? payload.sleep_stages ?? null,
    source: payload.source || 'manual',
    date: payload.date || getDateOnly(Date.now()),
  };
}

function withLegacyHealthAliases(item) {
  if (!item) return item;
  return {
    ...item,
    calories_burned: item.caloriesBurned ?? 0,
    exercise_minutes: item.exerciseMinutes ?? 0,
    stand_hours: item.standHours ?? 0,
    resting_heart_rate: item.restingHeartRate ?? null,
    respiratory_rate: item.respiratoryRate ?? null,
    sleep_duration: item.sleepDuration ?? null,
    sleep_quality: item.sleepQuality ?? null,
    sleep_stages: item.sleepStages ?? null,
  };
}

async function getGoogleConnectionForUser(user) {
  if (!user) return null;

  if (user.provider === 'google' && user.accessToken) {
    return {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken || null,
    };
  }

  await ensureDbReady();
  const connection = (db.data.connections || []).find((x) => x.uid === user.id && x.provider === 'google_fit');
  if (!connection || !connection.accessToken) return null;
  return {
    accessToken: connection.accessToken,
    refreshToken: connection.refreshToken || null,
  };
}

async function googleApiRequest(accessToken, url, init = {}) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...(init.headers || {}),
  };

  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Google API request failed (${response.status})`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return response.json();
}

async function fetchGoogleFitSteps(accessToken, days) {
  const endTimeMillis = Date.now();
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - Math.max(1, days) + 1);
  const startTimeMillis = startDate.getTime();

  const data = await googleApiRequest(
    accessToken,
    'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
        bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 },
        startTimeMillis,
        endTimeMillis,
      }),
    }
  );

  const buckets = Array.isArray(data.bucket) ? data.bucket : [];
  return buckets
    .map((bucket) => {
      const date = getDateOnly(Number(bucket.startTimeMillis));
      if (!date) return null;
      let count = 0;
      for (const dataset of bucket.dataset || []) {
        for (const point of dataset.point || []) {
          for (const value of point.value || []) {
            if (typeof value.intVal === 'number') count += value.intVal;
            if (typeof value.fpVal === 'number') count += Math.round(value.fpVal);
          }
        }
      }
      return { date, count };
    })
    .filter((entry) => entry && entry.count > 0);
}

async function fetchGoogleFitWorkouts(accessToken, days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - Math.max(1, days));

  const url = new URL('https://www.googleapis.com/fitness/v1/users/me/sessions');
  url.searchParams.set('startTime', start.toISOString());
  url.searchParams.set('endTime', end.toISOString());
  url.searchParams.set('includeDeleted', 'false');

  const data = await googleApiRequest(accessToken, url.toString());
  const sessions = Array.isArray(data.session) ? data.session : [];
  return sessions
    .map((session) => {
      const startMs = Number(session.startTimeMillis);
      const endMs = Number(session.endTimeMillis);
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return null;

      const date = getDateOnly(startMs);
      if (!date) return null;

      const duration = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));
      const exercise = session.name || `Activity ${session.activityType ?? 'Unknown'}`;

      return {
        date,
        duration,
        exercise,
        sourceSessionId: session.id || null,
      };
    })
    .filter(Boolean);
}

const app = express();
// Capture raw body for webhook signature verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(compression());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.get('/api/auth/providers', (_req, res) => {
  res.json({
    github: { configured: githubOauthConfigured, loginUrl: '/auth/github' },
    google: { configured: googleOauthConfigured, loginUrl: '/auth/google' },
  });
});

app.get('/auth/github', (req, res, next) => {
  if (!githubOauthConfigured) {
    return res.status(503).json({
      error: 'github_oauth_not_configured',
      message: 'GitHub OAuth is not configured on server. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
    });
  }
  return passport.authenticate('github')(req, res, next);
});
app.get(
  '/auth/github/callback',
  (req, res, next) => {
    if (!githubOauthConfigured) {
      return res.redirect(`${FRONTEND_URL}/auth?error=github_oauth_not_configured`);
    }
    return next();
  },
  passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/auth?error=github_auth_failed` }),
  (req, res) => {
    res.redirect(FRONTEND_URL);
  }
);

app.get('/auth/google', (req, res, next) => {
  if (!googleOauthConfigured) {
    return res.status(503).json({
      error: 'google_oauth_not_configured',
      message: 'Google OAuth is not configured on server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
    });
  }
  return passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
  })(req, res, next);
});

app.get(
  '/auth/google/callback',
  (req, res, next) => {
    if (!googleOauthConfigured) {
      return res.redirect(`${FRONTEND_URL}/auth?error=google_oauth_not_configured`);
    }
    return next();
  },
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/auth?error=google_auth_failed` }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/steps`);
  }
);

app.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => res.status(204).end());
  });
});

app.get('/api/user', (req, res) => {
  if (!req.user) return res.json({ user: null });

  ensureDbReady()
    .then(() => {
      const changed = upsertUserUsage(req.user, { incrementLogin: false });
      if (changed) return db.write();
      return null;
    })
    .catch((err) => {
      console.error('user analytics touch error', err);
    })
    .finally(() => {
      res.json({ user: toPublicUser(req.user) });
    });
});

app.get('/api/admin/stats', ensureAdmin, async (_req, res) => {
  await ensureDbReady();

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const users = db.data.users || [];
  const loginsByDate = db.data.analytics?.loginsByDate || {};

  const providerCounts = users.reduce((acc, user) => {
    const provider = user.provider || 'unknown';
    acc[provider] = Number(acc[provider] || 0) + 1;
    return acc;
  }, {});

  const totalLogins = users.reduce((sum, user) => sum + Number(user.loginCount || 0), 0);
  const newUsersLast7d = users.filter((user) => {
    const firstSeen = parseTimestamp(user.firstSeenAt);
    return Number.isFinite(firstSeen) && firstSeen >= now - 7 * oneDay;
  }).length;

  return res.json({
    generatedAt: new Date().toISOString(),
    users: {
      total: users.length,
      active24h: countUsersActiveSince(users, now - oneDay),
      active7d: countUsersActiveSince(users, now - 7 * oneDay),
      active30d: countUsersActiveSince(users, now - 30 * oneDay),
      newUsersLast7d,
      totalLogins,
      byProvider: providerCounts,
    },
    records: {
      journal: (db.data.journal || []).length,
      meals: (db.data.meals || []).length,
      workouts: (db.data.workouts || []).length,
      steps: (db.data.steps || []).length,
      healthData: (db.data.healthData || []).length,
    },
    traffic: {
      todayLogins: Number(loginsByDate[new Date().toISOString().slice(0, 10)] || 0),
      last14Days: buildLoginSeries(loginsByDate, 14),
    },
  });
});

app.get('/api/health/providers', ensureAuth, async (req, res) => {
  const googleConnection = await getGoogleConnectionForUser(req.user);
  res.json({
    googleFit: {
      connected: Boolean(googleConnection?.accessToken),
      loginUrl: '/auth/google',
    },
  });
});

app.post('/api/sync/google-fit', ensureAuth, async (req, res) => {
  try {
    const days = Math.min(90, Math.max(1, Number(req.body?.days) || 14));
    const googleConnection = await getGoogleConnectionForUser(req.user);

    if (!googleConnection?.accessToken) {
      return res.status(400).json({
        error: 'google_not_connected',
        message: 'Sign in with Google first to sync Google Fit data.',
      });
    }

    const [stepsFromGoogle, workoutsFromGoogle] = await Promise.all([
      fetchGoogleFitSteps(googleConnection.accessToken, days),
      fetchGoogleFitWorkouts(googleConnection.accessToken, days),
    ]);

    await ensureDbReady();
    db.data.steps = db.data.steps || [];
    db.data.workouts = db.data.workouts || [];

    const preservedSteps = db.data.steps.filter((item) => !(item.uid === req.user.id && item.source === 'google_fit'));
    const preservedWorkouts = db.data.workouts.filter(
      (item) => !(item.uid === req.user.id && item.source === 'google_fit')
    );

    const syncedAt = new Date().toISOString();
    const syncedSteps = stepsFromGoogle.map((step) => ({
      id: nanoid(),
      uid: req.user.id,
      count: Number(step.count),
      date: step.date,
      source: 'google_fit',
      created: syncedAt,
    }));

    const syncedWorkouts = workoutsFromGoogle.map((workout) => ({
      id: nanoid(),
      uid: req.user.id,
      exercise: workout.exercise,
      duration: Number(workout.duration),
      date: workout.date,
      source: 'google_fit',
      sourceSessionId: workout.sourceSessionId,
      created: syncedAt,
    }));

    db.data.steps = [...syncedSteps, ...preservedSteps];
    db.data.workouts = [...syncedWorkouts, ...preservedWorkouts];
    await db.write();

    return res.json({
      ok: true,
      provider: 'google_fit',
      days,
      stepsSynced: syncedSteps.length,
      workoutsSynced: syncedWorkouts.length,
      message: 'Google Fit sync completed.',
    });
  } catch (err) {
    console.error('google fit sync error', err);
    const unauthorized = err.status === 401 || err.status === 403;
    return res.status(unauthorized ? 401 : 500).json({
      error: unauthorized ? 'google_token_invalid' : 'sync_failed',
      message: unauthorized
        ? 'Google token expired or invalid. Please login with Google again.'
        : 'Failed to sync Google Fit data right now.',
    });
  }
});

app.get('/api/health-data', ensureAuth, async (req, res) => {
  await ensureDbReady();
  db.data.healthData = db.data.healthData || [];
  const items = db.data.healthData.filter((x) => x.uid === req.user.id).map(withLegacyHealthAliases);
  res.json(items);
});

app.post('/api/health-data', ensureAuth, async (req, res) => {
  await ensureDbReady();
  db.data.healthData = db.data.healthData || [];
  const normalizedPayload = normalizeHealthDataPayload(req.body || {});
  const item = {
    id: nanoid(),
    uid: req.user.id,
    caloriesBurned: normalizedPayload.caloriesBurned,
    exerciseMinutes: normalizedPayload.exerciseMinutes,
    standHours: normalizedPayload.standHours,
    restingHeartRate: normalizedPayload.restingHeartRate,
    respiratoryRate: normalizedPayload.respiratoryRate,
    sleepDuration: normalizedPayload.sleepDuration,
    sleepQuality: normalizedPayload.sleepQuality,
    sleepStages: normalizedPayload.sleepStages,
    source: normalizedPayload.source,
    date: normalizedPayload.date,
    created: new Date().toISOString(),
  };
  db.data.healthData.unshift(item);
  await db.write();
  res.status(201).json(withLegacyHealthAliases(item));
});

app.get('/api/health-data/summary', ensureAuth, async (req, res) => {
  await ensureDbReady();
  db.data.healthData = db.data.healthData || [];
  const items = db.data.healthData
    .filter((x) => x.uid === req.user.id)
    .sort((a, b) => new Date(b.date || b.created || 0) - new Date(a.date || a.created || 0));
  const latest = items[0] || null;
  return res.json({ latest: withLegacyHealthAliases(latest), count: items.length });
});

// GitHub Webhook endpoint with signature verification
app.post('/webhook', async (req, res) => {
  try {
    if (!WEBHOOK_SECRET) {
      return res.status(500).json({ error: 'WEBHOOK_SECRET not set' });
    }
    const signature = req.get('x-hub-signature-256');
    if (!signature) return res.status(400).send('Missing signature');

    const digest =
      'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET).update(req.rawBody || Buffer.from('')).digest('hex');

    const sigBuf = Buffer.from(signature);
    const digBuf = Buffer.from(digest);
    if (sigBuf.length !== digBuf.length || !crypto.timingSafeEqual(sigBuf, digBuf)) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.get('x-github-event') || 'unknown';
    const delivery = req.get('x-github-delivery') || nanoid();

    await ensureDbReady();
    db.data.webhooks = db.data.webhooks || [];
    db.data.webhooks.unshift({ id: delivery, event, payload: req.body, receivedAt: new Date().toISOString() });
    await db.write();

    res.status(200).send('ok');
  } catch (err) {
    console.error('webhook error', err);
    res.status(500).send('error');
  }
});

// Generic helpers for collections
function collectionRoutes(name) {
  app.get(`/api/${name}`, ensureAuth, async (req, res) => {
    await ensureDbReady();
    const items = (db.data[name] || []).filter((x) => x.uid === req.user.id);
    res.json(items);
  });

  app.post(`/api/${name}`, ensureAuth, async (req, res) => {
    await ensureDbReady();
    const item = { id: nanoid(), uid: req.user.id, ...req.body };
    db.data[name] = db.data[name] || [];
    db.data[name].unshift(item);
    await db.write();
    res.status(201).json(item);
  });

  app.delete(`/api/${name}/:id`, ensureAuth, async (req, res) => {
    await ensureDbReady();
    const id = req.params.id;
    db.data[name] = (db.data[name] || []).filter((x) => !(x.id === id && x.uid === req.user.id));
    await db.write();
    res.status(204).end();
  });
}

['journal', 'steps', 'meals', 'workouts'].forEach(collectionRoutes);

app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Serve production build if present
const buildDir = path.join(__dirname, '..', 'build');
const buildIndex = path.join(buildDir, 'index.html');
if (fs.existsSync(buildIndex)) {
  app.use(
    express.static(buildDir, {
      etag: true,
      maxAge: '7d',
      setHeaders: (res, filePath) => {
        const fileName = path.basename(filePath);
        if (/\.[a-f0-9]{8}\./i.test(fileName)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return;
        }
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      },
    })
  );
  app.get(/.*/, (req, res) => {
    res.sendFile(buildIndex);
  });
}

async function startServer() {
  try {
    await ensureDbReady();
    app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('[server] failed to initialize database', err);
    process.exit(1);
  }
}

startServer();
