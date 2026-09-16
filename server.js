import express from "express";
import cors from "cors";
import { db } from "./db.js";
import { calculateTotals } from "./pricing.js";
import { cleanPriceList } from "./priceListImport.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

function getTiers() {
  return db.prepare("SELECT id, name, description, color, price_paise AS pricePaise FROM tiers").all();
}

function getShowsWithAvailability() {
  const shows = db.prepare("SELECT id, time, label, hall, total_seats AS totalSeats FROM shows").all();
  const availabilityRows = db.prepare("SELECT show_id AS showId, tier_id AS tierId, available FROM show_availability").all();
  return shows.map((show) => {
    const availability = {};
    for (const row of availabilityRows) {
      if (row.showId === show.id) availability[row.tierId] = row.available;
    }
    return { ...show, availability };
  });
}

// Full app state in one call: tiers (with current prices), shows (with live availability).
app.get("/api/state", (_req, res) => {
  res.json({ tiers: getTiers(), shows: getShowsWithAvailability() });
});

app.get("/api/tiers", (_req, res) => {
  res.json({ tiers: getTiers() });
});

app.get("/api/shows", (_req, res) => {
  res.json({ shows: getShowsWithAvailability() });
});

// Create a booking: server re-validates availability and recalculates totals
// authoritatively (never trusts a total computed on the client), then
// atomically decrements seat inventory and stores the booking.
app.post("/api/bookings", (req, res) => {
  const { showId, basket, festivalEnabled, memberEnabled } = req.body ?? {};

  const show = db.prepare("SELECT id, total_seats AS totalSeats FROM shows WHERE id = ?").get(showId);
  if (!show) {
    return res.status(404).json({ error: `Unknown show: ${showId}` });
  }

  const tiers = getTiers();
  const tierPrices = Object.fromEntries(tiers.map((t) => [t.id, t.pricePaise]));
  const tierIds = new Set(tiers.map((t) => t.id));

  const cleanBasket = {};
  for (const [tierId, qty] of Object.entries(basket ?? {})) {
    if (!tierIds.has(tierId)) {
      return res.status(400).json({ error: `Unknown tier: ${tierId}` });
    }
    cleanBasket[tierId] = Math.max(0, Math.floor(Number(qty) || 0));
  }

  const availabilityRows = db
    .prepare("SELECT tier_id AS tierId, available FROM show_availability WHERE show_id = ?")
    .all(showId);
  const available = Object.fromEntries(availabilityRows.map((r) => [r.tierId, r.available]));

  for (const [tierId, qty] of Object.entries(cleanBasket)) {
    if (qty > (available[tierId] ?? 0)) {
      return res.status(409).json({
        error: `Not enough ${tierId} seats available`,
        tierId,
        requested: qty,
        available: available[tierId] ?? 0,
      });
    }
  }

  const totals = calculateTotals(cleanBasket, tierPrices, !!festivalEnabled, !!memberEnabled);
  if (totals.tickets === 0) {
    return res.status(400).json({ error: "Booking must include at least one ticket" });
  }

  const insertBooking = db.prepare(`
    INSERT INTO bookings
      (show_id, created_at, festival_applied, member_applied, ticket_subtotal, festival_discount, member_discount, convenience_fee, gst, total)
    VALUES (@showId, @createdAt, @festivalApplied, @memberApplied, @ticketSubtotal, @festivalDiscount, @memberDiscount, @convenienceFee, @gst, @total)
  `);
  const insertLine = db.prepare(`
    INSERT INTO booking_lines (booking_id, tier_id, quantity, unit_price_paise, line_total_paise)
    VALUES (?, ?, ?, ?, ?)
  `);
  const decrementAvailability = db.prepare(`
    UPDATE show_availability SET available = available - ? WHERE show_id = ? AND tier_id = ?
  `);

  const createBooking = db.transaction(() => {
    const info = insertBooking.run({
      showId,
      createdAt: new Date().toISOString(),
      festivalApplied: festivalEnabled ? 1 : 0,
      memberApplied: memberEnabled ? 1 : 0,
      ticketSubtotal: totals.ticketSubtotal,
      festivalDiscount: totals.festivalDiscount,
      memberDiscount: totals.memberDiscount,
      convenienceFee: totals.convenienceFee,
      gst: totals.gst,
      total: totals.total,
    });

    for (const line of totals.ticketLines) {
      insertLine.run(info.lastInsertRowid, line.tierId, line.quantity, line.unitPrice, line.lineTotal);
      decrementAvailability.run(line.quantity, showId, line.tierId);
    }

    return info.lastInsertRowid;
  });

  const bookingId = createBooking();
  const updatedShow = getShowsWithAvailability().find((s) => s.id === showId);

  res.status(201).json({ bookingId, totals, updatedShow });
});

app.get("/api/bookings", (_req, res) => {
  const bookings = db
    .prepare("SELECT id, show_id AS showId, created_at AS createdAt, total FROM bookings ORDER BY id DESC")
    .all();
  res.json({ bookings });
});

// Clean a messy price list, persist the result, and return the full report.
app.post("/api/price-list/import", (req, res) => {
  const rows = req.body?.rows;
  if (!Array.isArray(rows)) {
    return res.status(400).json({ error: "Expected { rows: [{ name, price }, ...] }" });
  }

  const report = cleanPriceList(rows);

  const upsert = db.prepare(`
    INSERT INTO imported_price_list (name, price_paise, imported_at)
    VALUES (@name, @pricePaise, @importedAt)
    ON CONFLICT(name) DO UPDATE SET price_paise = excluded.price_paise, imported_at = excluded.imported_at
  `);
  const insertEvent = db.prepare(`
    INSERT INTO price_import_events (created_at, imported_count, deduplicated_count, rejected_count, report_json)
    VALUES (?, ?, ?, ?, ?)
  `);

  const persist = db.transaction(() => {
    const now = new Date().toISOString();
    for (const [name, pricePaise] of Object.entries(report.priceList)) {
      upsert.run({ name, pricePaise, importedAt: now });
    }
    insertEvent.run(now, report.imported.length, report.deduplicated.length, report.rejected.length, JSON.stringify(report));
  });
  persist();

  res.json(report);
});

app.get("/api/price-list", (_req, res) => {
  const rows = db.prepare("SELECT name, price_paise AS pricePaise, imported_at AS importedAt FROM imported_price_list ORDER BY name").all();
  res.json({ priceList: rows });
});

// Apply a subset of the cleaned price list onto the live ticket tiers.
app.post("/api/tiers/apply-prices", (req, res) => {
  const updates = req.body?.updates;
  if (!updates || typeof updates !== "object") {
    return res.status(400).json({ error: "Expected { updates: { tierId: pricePaise } }" });
  }

  const tierIds = new Set(getTiers().map((t) => t.id));
  const update = db.prepare("UPDATE tiers SET price_paise = ? WHERE id = ?");

  const applied = [];
  const apply = db.transaction(() => {
    for (const [tierId, pricePaise] of Object.entries(updates)) {
      if (!tierIds.has(tierId)) continue;
      const paise = Math.round(Number(pricePaise));
      if (!Number.isFinite(paise) || paise < 0) continue;
      update.run(paise, tierId);
      applied.push(tierId);
    }
  });
  apply();

  res.json({ applied, tiers: getTiers() });
});

app.listen(PORT, () => {
  console.log(`Cine Ledger API listening on http://localhost:${PORT}`);
});
