const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const path = require('path');
const crypto = require('crypto');
const { db } = require('./lowdb');
const { nanoid } = require('nanoid');

const PORT = process.env.PORT || 4000;
const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL = 'http://localhost:4000/auth/github/callback',
  SESSION_SECRET = 'dev_secret_change_me',
  WEBHOOK_SECRET,
} = process.env;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.warn('[server] Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET. Set them in environment variables.');
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID || 'placeholder',
      clientSecret: GITHUB_CLIENT_SECRET || 'placeholder',
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ['read:user'],
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, { id: profile.id, username: profile.username, avatar: profile.photos?.[0]?.value || '' });
    }
  )
);

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.status(401).json({ error: 'unauthorized' });
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
app.get('/auth/github', passport.authenticate('github'));
app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:3000');
  }
);

app.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => res.status(204).end());
  });
});

app.get('/api/user', (req, res) => {
  res.json({ user: req.user || null });
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
app.use(express.static(path.join(__dirname, '..', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
