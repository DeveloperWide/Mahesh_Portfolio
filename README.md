# Mahesh_Portfolio

A Portfolio Project i will be building live on my YouTube....!

## Development

1. Start MongoDB (uses `server/.env` -> `MONGO_URL`)
2. Start backend:

```bash
npm -C server run dev
```

3. Start frontend:

```bash
npm -C client run dev
```

## Admin

Admin email is `maheshrana9520@gmail.com` (see `server/.env` -> `ADMIN_EMAIL`).

Admin dashboard:
- `http://localhost:5173/admin`

## Calls

- Frontend booking UI is on `http://localhost:5173/call` (Student mode only, 8 PM → 9 AM, 30m/60m, Razorpay payment).
- Admin bookings dashboard is on `http://localhost:5173/admin/calls`.
- Legal pages: `http://localhost:5173/terms`, `http://localhost:5173/privacy`, `http://localhost:5173/refunds`, `http://localhost:5173/delivery`

## Email Notifications

Backend can email you when:
- a call is booked
- the contact form is submitted

Configure in `server/.env` (see Email section). Default provider is `log` (prints to server console). For real emails, set `EMAIL_PROVIDER=smtp` with your SMTP credentials. Customers also receive confirmation emails for call bookings/contact submissions.

## Deployment (Render + Vercel)

See `DEPLOYMENT.md` for a step-by-step guide (env + commands).

**Backend (Render)**
- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Env: copy from `server/.env.example` and set **production values** (MongoDB Atlas, Razorpay LIVE keys, SMTP app password, `CORS_ORIGINS`, `PUBLIC_SITE_URL`).

**Frontend (Vercel)**
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Env: set `VITE_API_BASE_URL` to your Render backend URL + `/api` (see `client/.env.example`).

## Production

```bash
npm -C client run build
npm -C server run build
npm -C server start
```
