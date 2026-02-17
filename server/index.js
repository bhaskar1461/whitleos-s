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

const PORT = process.env.API_PORT || process.env.PORT || 4000;
const {
  FRONTEND_URL = 'http://localhost:3000',
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL = 'http://localhost:4000/auth/github/callback',
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL = 'http://localhost:4000/auth/google/callback',
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
      (accessToken, refreshToken, profile, done) => {
        done(null, { id: profile.id, username: profile.username, avatar: profile.photos?.[0]?.value || '', provider: 'github' });
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

          await db.read();
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

async function getGoogleConnectionForUser(user) {
  if (!user) return null;

  if (user.provider === 'google' && user.accessToken) {
    return {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken || null,
    };
  }

  await db.read();
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
    apple: { configured: false, loginUrl: '/auth/apple' },
    zepp: { configured: false, loginUrl: '/auth/zepp' },
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

app.get('/auth/apple', (_req, res) => {
  res.status(501).json({
    error: 'apple_health_not_supported_in_web',
    message: 'Apple Health data requires an iOS HealthKit bridge app; direct web login cannot fetch Apple Health data.',
  });
});

app.get('/auth/zepp', (_req, res) => {
  res.status(501).json({
    error: 'zepp_direct_api_not_available',
    message: 'Direct Zepp cloud sync is unavailable here. Sync Zepp app to Google Fit or Apple Health, then use sync.',
  });
});

app.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => res.status(204).end());
  });
});

app.get('/api/user', (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

app.get('/api/health/providers', ensureAuth, async (req, res) => {
  const googleConnection = await getGoogleConnectionForUser(req.user);
  res.json({
    googleFit: {
      connected: Boolean(googleConnection?.accessToken),
      loginUrl: '/auth/google',
    },
    appleHealth: {
      connected: false,
      loginUrl: '/auth/apple',
      note: 'Requires iOS app + HealthKit bridge',
    },
    zepp: {
      connected: false,
      loginUrl: '/auth/zepp',
      note: 'Sync Zepp with Google Fit or Apple Health first',
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

    await db.read();
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

    await db.read();
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
    await db.read();
    const items = (db.data[name] || []).filter((x) => x.uid === req.user.id);
    res.json(items);
  });

  app.post(`/api/${name}`, ensureAuth, async (req, res) => {
    await db.read();
    const item = { id: nanoid(), uid: req.user.id, ...req.body };
    db.data[name] = db.data[name] || [];
    db.data[name].unshift(item);
    await db.write();
    res.status(201).json(item);
  });

  app.delete(`/api/${name}/:id`, ensureAuth, async (req, res) => {
    await db.read();
    const id = req.params.id;
    db.data[name] = (db.data[name] || []).filter((x) => !(x.id === id && x.uid === req.user.id));
    await db.write();
    res.status(204).end();
  });
}

['journal', 'steps', 'meals', 'workouts'].forEach(collectionRoutes);

// Serve production build if present
const buildDir = path.join(__dirname, '..', 'build');
const buildIndex = path.join(buildDir, 'index.html');
if (fs.existsSync(buildIndex)) {
  app.use(express.static(buildDir));
  app.get(/.*/, (req, res) => {
    res.sendFile(buildIndex);
  });
} else {
  app.get('/healthz', (_req, res) => res.json({ ok: true }));
}

app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
