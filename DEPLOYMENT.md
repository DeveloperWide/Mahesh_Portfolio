# Deployment Guide (Render + Vercel)

This repo is a **Vite (React) frontend** in `client/` and an **Express + MongoDB backend** in `server/`.

## 1) MongoDB (Atlas)

1. Create a MongoDB Atlas cluster.
2. Create a database user and allow access from Render (either `0.0.0.0/0` or Render’s outbound IP range).
3. Copy your connection string and set it as `MONGO_URL` on Render.

Example:

```
MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
```

## 2) Backend on Render

Create a **Web Service** from this GitHub repo.

- **Root Directory:** `server`
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`

### Render environment variables

Copy keys from `server/.env.example` and set production values.

**Required**
- `MONGO_URL`
- `CORS_ORIGINS` (set to your Vercel domain, e.g. `https://your-site.vercel.app`)
- `PUBLIC_SITE_URL` (same as your Vercel domain, used in email links)
- `ADMIN_EMAIL` (your admin login email)
- `RAZORPAY_KEY_ID` (LIVE or TEST)
- `RAZORPAY_KEY_SECRET` (LIVE or TEST)
- `EMAIL_PROVIDER` (`smtp` for real emails)
- `EMAIL_TO` (where admin notifications should go)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` (only if `EMAIL_PROVIDER=smtp`)

**Recommended (production safety)**
- `ADMIN_SIGNUP_SECRET` (prevents random people from signing up as admin by email)

**Optional**
- `EMAIL_FROM`, `EMAIL_SUBJECT_PREFIX`
- `CALL_PRICE_30`, `CALL_PRICE_60`, `CALL_CURRENCY`
- `CALL_REQUIRE_PAYMENT` (defaults to `true` if Razorpay keys exist)

Notes:
- Render provides `PORT` automatically; the server reads `process.env.PORT`.
- If you use Gmail SMTP: enable 2FA and generate an **App Password**, then set `SMTP_PASS` to that app password (not your normal password).

## 3) Frontend on Vercel

Import the same GitHub repo into Vercel.

- **Root Directory:** `client`
- **Build Command:** `npm ci && npm run build`
- **Output Directory:** `dist`

### Vercel environment variables

Copy keys from `client/.env.example`.

**Required**
- `VITE_API_BASE_URL` (your Render backend URL + `/api`)

Example:

```
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

**Optional**
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_CLOUDINARY_FOLDER`

## 4) What NOT to put in Vercel env

Anything that’s secret **must not** be in Vercel env (because `VITE_*` is bundled into client JS and becomes public).

Do NOT put these in Vercel:
- `MONGO_URL`
- `RAZORPAY_KEY_SECRET`
- `SMTP_PASS`
- `ADMIN_SIGNUP_SECRET`
- any non-`VITE_` secret

These belong on Render only.

## 5) Post-deploy checklist

1. Update `CORS_ORIGINS` on Render to include your final Vercel domain.
2. Set `PUBLIC_SITE_URL` on Render to your final Vercel domain.
3. On the deployed site:
   - `/<legal>` pages: `/terms`, `/privacy`, `/refunds`, `/delivery`
   - Call booking: `/call` (Student mode)
   - Admin: `/admin` and `/admin/calls`

