# Solution reasoning

## Problem framing

The core risk is not the seat selector; it is producing a trustworthy amount when multiple money rules interact. The interface therefore treats the booking as a small pricing workflow:

1. Choose a showtime.
2. Choose quantities for each available ticket tier.
3. Apply eligible offers.
4. Add the per-ticket fee.
5. Calculate GST.
6. Show the exact receipt and final amount.

This order is visible in the numbered counter flow and is also reflected in the calculation code.

## Money representation

Money is stored as integer paise rather than JavaScript floating-point rupees. For example, ₹220.00 is stored as `22000`. This prevents binary floating-point errors from producing totals such as ₹219.999999 and makes the final receipt suitable for exact paisa evaluation.

The pricing function returns all intermediate values used by the receipt:

- ticket lines and ticket subtotal
- festival discount
- member discount
- convenience fee
- taxable amount
- GST
- final total

The UI does not recalculate any of these values separately. Every visible line comes from the same result object, which reduces the chance that the total and its breakup disagree.

## Discount and tax order

The implementation applies the rules in this order:

```text
ticket subtotal
- festival flat discount
- member percentage discount, capped at ₹180
= discounted ticket value
+ convenience fee for every ticket
= taxable amount
+ 18% GST, rounded to the nearest paisa
= amount to collect
```

The festival discount is limited to the ticket subtotal, so the price cannot become negative. The member discount is calculated from the remaining ticket value and is capped by both the configured member limit and the remaining amount.

## Inventory behavior

Each showtime has availability for Silver, Gold, and Recliner tiers. When a tier has zero seats, the row is visibly marked as sold out and its quantity controls are disabled. Switching showtimes clamps any existing basket quantities to the new show's availability, preventing the UI from carrying an invalid booking between shows.

The data is served by an Express API instead of being embedded in the React screen. Showtimes and bookings are persisted in `server/store.json`; the browser reloads inventory from the API, and confirming a booking decrements the selected tier availability. The server validates availability again before saving, so a modified browser request cannot bypass the sold-out rule.

The data is modeled as arrays and records rather than being tied to one screen element, so another cinema can replace the showtime and tier data without changing the pricing flow.

## Dynamic architecture

The frontend calls `/api/config` and `/api/shows` on startup. Each basket or offer change sends the current selection to `/api/quotes`, which returns the authoritative server-side calculation. Confirmation posts the same payload to `/api/bookings`; the server recalculates the quote, checks current availability, updates the store, and returns a booking identifier.

This keeps the UI responsive while making the server the source of truth for the amount collected. A small serialized write queue protects the JSON store from overlapping writes during local development and assessment runs.

## Interface decisions

The design is intentionally made for a busy counter:

- The current show and inventory state are visible without opening a secondary page.
- The booking summary stays sticky on larger screens so the operator can always see the amount being collected.
- The receipt uses a dark, high-contrast surface to separate the financial result from the selection controls.
- Offer cards make the active state and discount rule explicit.
- The final amount is accompanied by a “pricing checks passed” message and a visible note that GST includes the fee.
- Responsive styles preserve the same flow on narrow screens.

## Trade-offs and limitations

This submission keeps the data layer local so an evaluator can clone and run it with only npm, while still exposing a real API and persisting bookings. A production cinema counter serving multiple server instances would move the JSON store to PostgreSQL with a transaction or row lock for seat reservation. The next reliability step would be automated tests for discount caps, tax rounding, sold-out tiers, and receipt reconciliation.

## Verification

- TypeScript compilation and the Vite production build pass with `npm run build`.
- The Replit preview workflow runs on port 5000.
- The rendered preview was checked for the main booking flow and browser console errors.