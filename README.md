# Cine Ledger

Cine Ledger is a cinema counter pricing console built for the Auriga assessment. It lets a counter operator choose a showtime, select seats by tier, apply eligible offers, and confirm an exact line-by-line booking total.

## Tech stack

- React 19
- TypeScript
- Vite
- Node.js + Express API
- JSON-backed persistent counter store
- Lucide React
- CSS with responsive layouts

## Project setup

### Requirements

- Node.js 20 or newer
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

This starts the Express API and Vite frontend together. The server runs on port `5000` and binds to `0.0.0.0` so it works in the Replit preview.

### Create a production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Debugging

1. Start the app with `npm run dev`.
2. Open the local preview at `http://localhost:5000`.
3. Check the browser console for runtime errors.
4. If the preview is blank in Replit, confirm the `Start application` workflow is running and that the app is using port `5000`.
5. If dependencies are out of date, remove `node_modules` and `package-lock.json`, then run `npm install` again.
6. Check the API directly with `curl http://localhost:5000/api/shows`.
7. Run `npm run build` to catch TypeScript errors before making a submission.

## Pricing rules

All money calculations are performed using integer paise:

- Silver: ₹220.00 per ticket
- Gold: ₹320.00 per ticket
- Recliner: ₹480.00 per ticket
- Festival offer: ₹150.00 flat discount per booking
- Member offer: 12% discount after the festival discount, capped at ₹180.00
- Convenience fee: ₹22.00 per ticket
- GST: 18% on the discounted ticket value plus the convenience fee

The receipt shows each tier, subtotal, discount, fee, GST, and final total from the same server-side calculation function.

## Dynamic API

The browser uses these API routes:

```text
GET  /api/config
GET  /api/shows
POST /api/quotes
POST /api/bookings
GET  /api/bookings/:id
```

Show availability and saved bookings are stored in `server/store.json`. Booking confirmation updates availability and keeps the booking in the store after a page refresh. The write queue serializes bookings within the running server process so two overlapping requests cannot update the same JSON file at the same time.

## Repository structure

```text
.
├── public/favicon.svg
├── server/index.js
├── server/pricing.js
├── server/store.json
├── src/App.tsx
├── src/main.tsx
├── src/styles.css
├── index.html
├── package.json
├── REASONING.md
└── AI_LOGS.md
```

## Current scope

The app is a working full-stack assessment implementation with a local persistent store. It is intentionally dependency-light and does not require external credentials or a hosted database. For a multi-instance production deployment, replace `server/store.json` with a transactional PostgreSQL store and add authentication, but the frontend/API boundary and server-side pricing flow are already in place.