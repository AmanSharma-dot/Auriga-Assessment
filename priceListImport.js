export function parsePriceToPaise(raw) {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (s.length === 0) return null;

  const isParenNegative = /^\(.*\)$/.test(s);
  if (isParenNegative) s = s.slice(1, -1).trim();

  s = s.replace(/^(₹|rs\.?|inr)\s*/i, "");
  s = s.replace(/\s*(₹|rs\.?|inr)\s*$/i, "");
  s = s.replace(/\/-\s*$/, "");
  s = s.replace(/,/g, "");
  s = s.trim();

  if (s.length === 0 || !/^-?\d+(\.\d+)?$/.test(s)) return null;

  const num = Number(s);
  if (!Number.isFinite(num)) return null;

  const signed = isParenNegative ? -Math.abs(num) : num;
  return Math.round(signed * 100);
}

function normalizeKey(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function toDisplayName(name) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  return trimmed
    .split(" ")
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

/**
 * @param {{name: string, price: string}[]} rows
 */
export function cleanPriceList(rows) {
  const imported = [];
  const deduplicated = [];
  const rejected = [];

  const acceptedPaise = new Map();
  const acceptedDisplay = new Map();

  for (const row of rows) {
    const trimmedName = (row.name ?? "").trim();

    if (trimmedName.length === 0) {
      rejected.push({ raw: row, reason: "blank_name" });
      continue;
    }

    const key = normalizeKey(trimmedName);
    const paise = parsePriceToPaise(row.price);

    let reason = null;
    if (paise === null) {
      reason = (row.price ?? "").trim().length === 0 ? "blank_price" : "unparseable_price";
    } else if (paise < 0) {
      reason = "negative_price";
    }

    if (acceptedPaise.has(key)) {
      deduplicated.push({
        canonicalName: acceptedDisplay.get(key),
        raw: row,
        keptPaise: acceptedPaise.get(key),
        discardedPaise: reason ? null : paise,
        discardedReason: reason,
      });
      continue;
    }

    if (reason) {
      rejected.push({ raw: row, reason });
      continue;
    }

    acceptedPaise.set(key, paise);
    acceptedDisplay.set(key, toDisplayName(trimmedName));
    imported.push({ canonicalName: toDisplayName(trimmedName), paise, sourceRaw: row });
  }

  const priceList = {};
  for (const [key, paise] of acceptedPaise) {
    priceList[acceptedDisplay.get(key)] = paise;
  }

  return { imported, deduplicated, rejected, priceList };
}
