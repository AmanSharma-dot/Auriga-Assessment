# Cine Ledger

Cine Ledger is a cinema counter pricing console built for the Auriga assessment. It lets a counter operator choose a showtime, select seats by tier, apply eligible offers, and confirm an exact line-by-line booking total.

## Tech stack

- React 19
- TypeScript
- Vite
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

The Vite server runs on port `5000` and binds to `0.0.0.0` so it works in the Replit preview.

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
6. Run `npm run build` to catch TypeScript errors before making a submission.

## Pricing rules

All money calculations are performed using integer paise:

- Silver: ₹220.00 per ticket
- Gold: ₹320.00 per ticket
- Recliner: ₹480.00 per ticket
- Festival offer: ₹150.00 flat discount per booking
- Member offer: 12% discount after the festival discount, capped at ₹180.00
- Convenience fee: ₹22.00 per ticket
- GST: 18% on the discounted ticket value plus the convenience fee

The receipt shows each tier, subtotal, discount, fee, GST, and final total from the same calculation function.

## Repository structure

```text
.
├── public/favicon.svg
├── src/App.tsx
├── src/main.tsx
├── src/styles.css
├── index.html
├── package.json
├── REASONING.md
└── AI_LOGS.md
```

## Current scope

The app is a self-contained frontend assessment implementation. Showtimes and inventory are representative in-memory data, which keeps the assessment easy to run without a backend or external credentials. Persistent inventory, concurrency-safe seat reservation, and a payment provider can be added as a follow-up.