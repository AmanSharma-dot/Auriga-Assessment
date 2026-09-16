import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.sqlite");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS tiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL,
    price_paise INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS shows (
    id TEXT PRIMARY KEY,
    time TEXT NOT NULL,
    label TEXT NOT NULL,
    hall TEXT NOT NULL,
    total_seats INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS show_availability (
    show_id TEXT NOT NULL REFERENCES shows(id),
    tier_id TEXT NOT NULL REFERENCES tiers(id),
    available INTEGER NOT NULL,
    PRIMARY KEY (show_id, tier_id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show_id TEXT NOT NULL REFERENCES shows(id),
    created_at TEXT NOT NULL,
    festival_applied INTEGER NOT NULL,
    member_applied INTEGER NOT NULL,
    ticket_subtotal INTEGER NOT NULL,
    festival_discount INTEGER NOT NULL,
    member_discount INTEGER NOT NULL,
    convenience_fee INTEGER NOT NULL,
    gst INTEGER NOT NULL,
    total INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS booking_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    tier_id TEXT NOT NULL REFERENCES tiers(id),
    quantity INTEGER NOT NULL,
    unit_price_paise INTEGER NOT NULL,
    line_total_paise INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS imported_price_list (
    name TEXT PRIMARY KEY,
    price_paise INTEGER NOT NULL,
    imported_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS price_import_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    imported_count INTEGER NOT NULL,
    deduplicated_count INTEGER NOT NULL,
    rejected_count INTEGER NOT NULL,
    report_json TEXT NOT NULL
  );
`);

function seedIfEmpty() {
  const tierCount = db.prepare("SELECT COUNT(*) AS n FROM tiers").get().n;
  if (tierCount > 0) return;

  const insertTier = db.prepare(
    "INSERT INTO tiers (id, name, description, color, price_paise) VALUES (?, ?, ?, ?, ?)",
  );
  const insertShow = db.prepare(
    "INSERT INTO shows (id, time, label, hall, total_seats) VALUES (?, ?, ?, ?, ?)",
  );
  const insertAvailability = db.prepare(
    "INSERT INTO show_availability (show_id, tier_id, available) VALUES (?, ?, ?)",
  );

  const seed = db.transaction(() => {
    insertTier.run("silver", "Silver", "Standard seating", "silver", 22000);
    insertTier.run("gold", "Gold", "Extra legroom", "gold", 32000);
    insertTier.run("recliner", "Recliner", "Electric recline", "recliner", 48000);

    insertShow.run("early", "6:15 PM", "Early show", "Audi 04", 78);
    insertShow.run("prime", "8:45 PM", "Prime time", "Audi 04", 78);
    insertShow.run("late", "10:55 PM", "Late show", "Audi 02", 78);

    const availability = {
      early: { silver: 42, gold: 16, recliner: 4 },
      prime: { silver: 0, gold: 9, recliner: 6 },
      late: { silver: 18, gold: 3, recliner: 0 },
    };
    for (const [showId, tiers] of Object.entries(availability)) {
      for (const [tierId, seats] of Object.entries(tiers)) {
        insertAvailability.run(showId, tierId, seats);
      }
    }
  });

  seed();
}

seedIfEmpty();
