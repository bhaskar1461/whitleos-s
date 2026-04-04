# Whiteloo

Premium automated protein drink platform built with Next.js App Router, Tailwind CSS, Framer Motion, MongoDB, Mongoose, and JWT authentication.

## Product

Whiteloo is a dark, investor-ready launch experience for a luxury protein drink brand:

- Premium landing page with neon-green luxury styling
- Waitlist capture with duplicate prevention
- JWT signup and login flow
- User dashboard with drink preference presets and QR/NFC mock access
- Admin console for users, waitlist, locations, and launch analytics

## Stack

- Next.js 14 App Router
- Tailwind CSS
- Framer Motion
- MongoDB Atlas + Mongoose
- JWT auth with secure HTTP-only cookies
- Vercel-ready deployment setup

## Project Structure

```text
src/
  app/
    api/
      auth/
      admin/
      user/
      waitlist/
    admin/
    dashboard/
    login/
    signup/
    globals.css
    layout.js
    page.js
  components/
    admin-view.jsx
    auth-form.jsx
    dashboard-view.jsx
    preferences-form.jsx
    site-header.jsx
    site-footer.jsx
    waitlist-form.jsx
  lib/
    api.js
    auth.js
    db.js
    http.js
    site.js
    utils.js
    validation.js
  models/
    Location.js
    User.js
    Waitlist.js
public/
  whiteloo-machine.svg
legacy-python-app/
services/
  rust-analytics/
```

## Environment Variables

Copy `.env.example` to `.env.local` or `.env` and set:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whiteloo
MONGODB_DB_NAME=whiteloo
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=7d
ADMIN_EMAILS=admin@whiteloo.com
BCRYPT_SALT_ROUNDS=12
```

`ADMIN_EMAILS` controls which signup emails become admin users.

## Local Development

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

3. Start the development server

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Production Build

```bash
npm run build
npm start
```

## Main Routes

### Pages

- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/admin`

### API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/user/me`
- `PUT /api/user/preferences`
- `POST /api/waitlist`
- `GET /api/admin/users`
- `GET /api/admin/waitlist`
- `GET /api/admin/location`
- `POST /api/admin/location`
- `GET /api/admin/analytics`
- `GET /api/healthz`

## Notes

- The previous Python service folder was preserved as `legacy-python-app/` so it no longer conflicts with Next.js App Router routing.
- The Rust analytics service in `services/rust-analytics/` was left untouched.
