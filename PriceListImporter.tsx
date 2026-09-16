import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, XCircle } from "lucide-react";
import { messySeatPriceList, type RawPriceRow } from "../data/messySeatPriceList";
import { importPriceList } from "../api";
import "./PriceListImporter.css";

type RejectionReason = "blank_name" | "blank_price" | "unparseable_price" | "negative_price";

interface ImportedEntry {
  canonicalName: string;
  paise: number;
  sourceRaw: RawPriceRow;
}
interface DuplicateRow {
  canonicalName: string;
  raw: RawPriceRow;
  keptPaise: number;
  discardedPaise: number | null;
  discardedReason: RejectionReason | null;
}
interface RejectedRow {
  raw: RawPriceRow;
  reason: RejectionReason;
}
interface ImportReport {
  imported: ImportedEntry[];
  deduplicated: DuplicateRow[];
  rejected: RejectedRow[];
  priceList: Record<string, number>;
}

const REASON_LABEL: Record<RejectionReason, string> = {
  blank_name: "Blank seat-class name",
  blank_price: "Blank price",
  unparseable_price: "Unparseable price format",
  negative_price: "Negative price",
};

function paiseToRupeeDisplay(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

interface PriceListImporterProps {
  /** Optional: pass your own messy rows instead of the bundled sample list. */
  source?: RawPriceRow[];
  /** Called with the cleaned {seatClass: paise} map when the operator applies it. */
  onApply?: (priceList: Record<string, number>) => void;
}

export default function PriceListImporter({ source, onApply }: PriceListImporterProps) {
  const [report, setReport] = useState<ImportReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    importPriceList(source ?? messySeatPriceList)
      .then((result) => {
        if (!cancelled) setReport(result as ImportReport);
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach the price-import API. Is the backend server running?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [source]);

  return (
    <section className="price-import">
      <header className="price-import__header">
        <h2>Seat-class price list import</h2>
        {report && (
          <p>
            {report.imported.length} imported · {report.deduplicated.length} de-duplicated ·{" "}
            {report.rejected.length} rejected
          </p>
        )}
      </header>

      {loading && (
        <div className="price-import__status">
          <Loader2 size={16} className="price-import__spin" /> Cleaning and persisting price list...
        </div>
      )}
      {error && <div className="price-import__status price-import__status--error">{error}</div>}

      {report && (
        <>
          <div className="price-import__clean">
            <h3>Clean price list</h3>
            <table>
              <thead>
                <tr>
                  <th>Seat class</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.priceList).map(([name, paise]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{paiseToRupeeDisplay(paise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {onApply && (
              <button
                className="price-import__apply"
                onClick={() => {
                  onApply(report.priceList);
                  setApplied(true);
                }}
              >
                <Copy size={16} />
                {applied ? "Applied to ticket tiers" : "Apply to ticket tiers"}
              </button>
            )}
          </div>

          <div className="price-import__grid">
            <div className="price-import__panel">
              <h3>
                <CheckCircle2 size={16} /> Imported ({report.imported.length})
              </h3>
              <ul>
                {report.imported.map((entry, i) => (
                  <li key={i}>
                    <span>{entry.canonicalName}</span>
                    <code>
                      "{entry.sourceRaw.name}" / "{entry.sourceRaw.price}"
                    </code>
                    <span>{paiseToRupeeDisplay(entry.paise)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="price-import__panel">
              <h3>De-duplicated ({report.deduplicated.length})</h3>
              <ul>
                {report.deduplicated.map((dup, i) => (
                  <li key={i}>
                    <span>{dup.canonicalName}</span>
                    <code>
                      "{dup.raw.name}" / "{dup.raw.price}"
                    </code>
                    <span>
                      kept {paiseToRupeeDisplay(dup.keptPaise)}
                      {dup.discardedPaise !== null
                        ? `, discarded ${paiseToRupeeDisplay(dup.discardedPaise)}`
                        : dup.discardedReason
                        ? `, discarded (${REASON_LABEL[dup.discardedReason]})`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="price-import__panel">
              <h3>
                <XCircle size={16} /> Rejected ({report.rejected.length})
              </h3>
              <ul>
                {report.rejected.map((r, i) => (
                  <li key={i}>
                    <span>"{r.raw.name || "(blank)"}"</span>
                    <code>"{r.raw.price || "(blank)"}"</code>
                    <span>{REASON_LABEL[r.reason]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
