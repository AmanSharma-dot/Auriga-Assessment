import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock3,
  CreditCard,
  Info,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

type TierId = "silver" | "gold" | "recliner";

type Tier = {
  id: TierId;
  name: string;
  description: string;
  price: number;
  color: string;
};

type Show = {
  id: string;
  time: string;
  label: string;
  hall: string;
  availability: Record<TierId, number>;
  totalSeats: number;
};

type Basket = Record<TierId, number>;

const TIERS: Tier[] = [
  {
    id: "silver",
    name: "Silver",
    description: "Standard seating",
    price: 22000,
    color: "silver",
  },
  {
    id: "gold",
    name: "Gold",
    description: "Extra legroom",
    price: 32000,
    color: "gold",
  },
  {
    id: "recliner",
    name: "Recliner",
    description: "Electric recline",
    price: 48000,
    color: "recliner",
  },
];

const SHOWS: Show[] = [
  {
    id: "early",
    time: "6:15 PM",
    label: "Early show",
    hall: "Audi 04",
    availability: { silver: 42, gold: 16, recliner: 4 },
    totalSeats: 78,
  },
  {
    id: "prime",
    time: "8:45 PM",
    label: "Prime time",
    hall: "Audi 04",
    availability: { silver: 0, gold: 9, recliner: 6 },
    totalSeats: 78,
  },
  {
    id: "late",
    time: "10:55 PM",
    label: "Late show",
    hall: "Audi 02",
    availability: { silver: 18, gold: 3, recliner: 0 },
    totalSeats: 78,
  },
];

const FESTIVAL_DISCOUNT = 15000;
const MEMBER_RATE = 0.12;
const MEMBER_CAP = 18000;
const CONVENIENCE_FEE = 2200;
const GST_RATE = 0.18;

const INITIAL_BASKET: Basket = { silver: 2, gold: 1, recliner: 0 };

function formatMoney(paise: number, showDecimals = true) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(paise / 100);
}

function calculateTotals(
  basket: Basket,
  festivalEnabled: boolean,
  memberEnabled: boolean,
) {
  const ticketLines = TIERS.filter((tier) => basket[tier.id] > 0).map((tier) => ({
    ...tier,
    quantity: basket[tier.id],
    lineTotal: basket[tier.id] * tier.price,
  }));
  const ticketSubtotal = ticketLines.reduce((total, line) => total + line.lineTotal, 0);
  const tickets = Object.values(basket).reduce((total, quantity) => total + quantity, 0);
  const festivalDiscount = festivalEnabled
    ? Math.min(FESTIVAL_DISCOUNT, ticketSubtotal)
    : 0;
  const afterFestival = ticketSubtotal - festivalDiscount;
  const rawMemberDiscount = memberEnabled ? Math.round(afterFestival * MEMBER_RATE) : 0;
  const memberDiscount = Math.min(rawMemberDiscount, MEMBER_CAP, afterFestival);
  const convenienceFee = tickets * CONVENIENCE_FEE;
  const taxableAmount = afterFestival - memberDiscount + convenienceFee;
  const gst = Math.round(taxableAmount * GST_RATE);
  const total = taxableAmount + gst;

  return {
    ticketLines,
    ticketSubtotal,
    tickets,
    festivalDiscount,
    memberDiscount,
    convenienceFee,
    taxableAmount,
    gst,
    total,
  };
}

function App() {
  const [selectedShowId, setSelectedShowId] = useState("early");
  const [basket, setBasket] = useState<Basket>(INITIAL_BASKET);
  const [festivalEnabled, setFestivalEnabled] = useState(true);
  const [memberEnabled, setMemberEnabled] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  const selectedShow = SHOWS.find((show) => show.id === selectedShowId) ?? SHOWS[0];
  const totals = useMemo(
    () => calculateTotals(basket, festivalEnabled, memberEnabled),
    [basket, festivalEnabled, memberEnabled],
  );

  function setShow(show: Show) {
    setSelectedShowId(show.id);
    setBasket((current) => ({
      silver: Math.min(current.silver, show.availability.silver),
      gold: Math.min(current.gold, show.availability.gold),
      recliner: Math.min(current.recliner, show.availability.recliner),
    }));
  }

  function changeQuantity(tierId: TierId, delta: number) {
    setBasket((current) => {
      const nextValue = Math.max(
        0,
        Math.min(current[tierId] + delta, selectedShow.availability[tierId]),
      );
      return { ...current, [tierId]: nextValue };
    });
  }

  function resetBooking() {
    setBasket({ silver: 0, gold: 0, recliner: 0 });
    setFestivalEnabled(false);
    setMemberEnabled(false);
    setShowReceipt(false);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Ticket size={18} strokeWidth={2.4} />
          </div>
          <div>
            <div className="brand-name">Cine Ledger</div>
            <div className="brand-caption">Counter console</div>
          </div>
        </div>

        <div className="venue-context">
          <div className="venue-dot" />
          <div>
            <div className="venue-name">Northstar Cinemas</div>
            <div className="venue-meta">Andheri East · Friday, 25 Oct</div>
          </div>
          <ChevronDown size={15} className="muted-icon" />
        </div>

        <div className="topbar-actions">
          <div className="shift-status">
            <span className="status-pulse" />
            Counter 03 <span className="status-divider" /> Online
          </div>
          <button className="avatar-button" aria-label="Open counter profile">
            AM
          </button>
        </div>
      </header>

      <div className="page-wrap">
        <div className="page-heading">
          <div>
            <div className="eyebrow"><span /> LIVE BOOKING DESK</div>
            <h1>Friday night, sorted.</h1>
            <p className="heading-copy">
              Build a clean booking in seconds. Every rupee is accounted for.
            </p>
          </div>
          <div className="heading-actions">
            <button className="ghost-button" onClick={resetBooking}>
              <RotateCcw size={15} />
              Clear booking
            </button>
            <div className="last-sync">
              <span className="sync-dot" />
              Inventory synced 12 sec ago
            </div>
          </div>
        </div>

        <div className="workspace-grid">
          <section className="booking-column">
            <div className="section-label">
              <span className="section-number">01</span>
              <div>
                <h2>Choose a show</h2>
                <p>Live seat availability by showtime</p>
              </div>
            </div>

            <div className="show-grid">
              {SHOWS.map((show) => {
                const isSelected = show.id === selectedShowId;
                const availableSeats = Object.values(show.availability).reduce(
                  (sum, count) => sum + count,
                  0,
                );
                return (
                  <button
                    key={show.id}
                    className={`show-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setShow(show)}
                  >
                    <div className="show-card-top">
                      <span className={`selection-indicator ${isSelected ? "checked" : ""}`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className="show-label">{show.label}</span>
                    </div>
                    <div className="show-time">{show.time}</div>
                    <div className="show-meta">
                      <span>{show.hall}</span>
                      <span className="meta-divider">·</span>
                      <span>{availableSeats} seats left</span>
                    </div>
                    <div className="show-progress">
                      <span style={{ width: `${(availableSeats / show.totalSeats) * 100}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="section-label seats-label">
              <span className="section-number">02</span>
              <div>
                <h2>Build your seat mix</h2>
                <p>Select the number of tickets for each tier</p>
              </div>
              <div className="selected-count">
                <Users size={14} />
                {totals.tickets} {totals.tickets === 1 ? "ticket" : "tickets"}
              </div>
            </div>

            <div className="tier-list">
              {TIERS.map((tier) => {
                const available = selectedShow.availability[tier.id];
                const quantity = basket[tier.id];
                const soldOut = available === 0;
                return (
                  <div className={`tier-row ${soldOut ? "sold-out" : ""}`} key={tier.id}>
                    <div className={`tier-swatch ${tier.color}`} />
                    <div className="tier-info">
                      <div className="tier-title-line">
                        <h3>{tier.name}</h3>
                        {soldOut && <span className="sold-out-tag">Sold out</span>}
                      </div>
                      <p>{soldOut ? "Unavailable for this show" : tier.description}</p>
                    </div>
                    <div className="tier-availability">
                      {soldOut ? "No seats" : `${available} available`}
                    </div>
                    <div className="tier-price">{formatMoney(tier.price, false)}</div>
                    <div className="stepper">
                      <button
                        onClick={() => changeQuantity(tier.id, -1)}
                        disabled={soldOut || quantity === 0}
                        aria-label={`Remove one ${tier.name} ticket`}
                      >
                        <Minus size={15} />
                      </button>
                      <span>{quantity}</span>
                      <button
                        onClick={() => changeQuantity(tier.id, 1)}
                        disabled={soldOut || quantity >= available}
                        aria-label={`Add one ${tier.name} ticket`}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-label offers-label">
              <span className="section-number">03</span>
              <div>
                <h2>Apply offers</h2>
                <p>Discounts are applied before tax</p>
              </div>
            </div>

            <div className="offers-grid">
              <OfferCard
                active={festivalEnabled}
                icon={<Sparkles size={17} />}
                eyebrow="OFFER 01"
                title="Festival flat-off"
                detail="Save ₹150.00 on this booking"
                tag="AUTO-APPLIED"
                onClick={() => setFestivalEnabled((value) => !value)}
              />
              <OfferCard
                active={memberEnabled}
                icon={<BadgeCheck size={17} />}
                eyebrow="OFFER 02"
                title="Auriga member"
                detail="12% off · capped at ₹180.00"
                tag="MEMBER"
                onClick={() => setMemberEnabled((value) => !value)}
              />
            </div>

            <div className="calculation-note">
              <Info size={16} />
              <span>GST is calculated on the discounted ticket value plus the convenience fee.</span>
            </div>
          </section>

          <aside className="summary-column">
            <div className="summary-card">
              <div className="summary-topline">
                <div>
                  <div className="summary-kicker">BOOKING SUMMARY</div>
                  <h2>Ready to confirm?</h2>
                </div>
                <div className="summary-badge">DRAFT</div>
              </div>

              <div className="summary-show">
                <div className="movie-poster">
                  <div className="poster-shape poster-shape-one" />
                  <div className="poster-shape poster-shape-two" />
                  <span>NS</span>
                </div>
                <div className="summary-show-info">
                  <div className="summary-movie-title">The Night Shift</div>
                  <div className="summary-show-meta">
                    <Clock3 size={13} />
                    {selectedShow.time} <span>·</span> {selectedShow.hall}
                  </div>
                </div>
                <ArrowUpRight size={16} className="summary-link-icon" />
              </div>

              <div className="receipt-divider" />

              <div className="receipt-section">
                <div className="receipt-section-title">
                  <span>Tickets</span>
                  <span>{totals.tickets} {totals.tickets === 1 ? "ticket" : "tickets"}</span>
                </div>
                <div className="receipt-lines">
                  {totals.ticketLines.length === 0 ? (
                    <div className="empty-receipt">Add at least one ticket to continue.</div>
                  ) : (
                    totals.ticketLines.map((line) => (
                      <div className="receipt-line" key={line.id}>
                        <span>{line.name} <em>× {line.quantity}</em></span>
                        <strong>{formatMoney(line.lineTotal)}</strong>
                      </div>
                    ))
                  )}
                </div>
                <div className="receipt-line subtotal-line">
                  <span>Ticket subtotal</span>
                  <strong>{formatMoney(totals.ticketSubtotal)}</strong>
                </div>
              </div>

              <div className="receipt-section adjustments">
                <div className="receipt-section-title">
                  <span>Adjustments</span>
                  <span className="applied-label">APPLIED</span>
                </div>
                <div className="receipt-line discount-line">
                  <span>Festival flat-off</span>
                  <strong>{totals.festivalDiscount ? `− ${formatMoney(totals.festivalDiscount)}` : "—"}</strong>
                </div>
                <div className="receipt-line discount-line">
                  <span>Member discount <em>{memberEnabled ? "12%" : "off"}</em></span>
                  <strong>{totals.memberDiscount ? `− ${formatMoney(totals.memberDiscount)}` : "—"}</strong>
                </div>
                <div className="receipt-line">
                  <span>Convenience fee <em>× {totals.tickets}</em></span>
                  <strong>{formatMoney(totals.convenienceFee)}</strong>
                </div>
                <div className="receipt-line">
                  <span>GST <em>18%</em></span>
                  <strong>{formatMoney(totals.gst)}</strong>
                </div>
              </div>

              <div className="receipt-divider" />

              <div className="total-row">
                <div>
                  <span className="total-label">Amount to collect</span>
                  <span className="total-caption">Inclusive of GST</span>
                </div>
                <strong>{formatMoney(totals.total)}</strong>
              </div>

              <button
                className="confirm-button"
                disabled={totals.tickets === 0}
                onClick={() => setShowReceipt(true)}
              >
                <CreditCard size={17} />
                Confirm booking
                <ArrowUpRight size={16} />
              </button>
              <div className="secure-note">
                <ShieldCheck size={14} />
                Exact paisa calculation · No hidden charges
              </div>
            </div>

            <div className="audit-card">
              <div className="audit-icon"><Check size={15} strokeWidth={2.5} /></div>
              <div>
                <strong>Pricing checks passed</strong>
                <p>All discounts, fees, and tax reconcile to the final total.</p>
              </div>
              <ArrowDownRight size={15} className="audit-arrow" />
            </div>
          </aside>
        </div>
      </div>

      {showReceipt && (
        <div className="toast" role="status">
          <div className="toast-icon"><Check size={16} /></div>
          <div>
            <strong>Booking ready to collect</strong>
            <span>{totals.tickets} tickets · {formatMoney(totals.total)}</span>
          </div>
          <button onClick={() => setShowReceipt(false)} aria-label="Dismiss confirmation">×</button>
        </div>
      )}
    </main>
  );
}

type OfferCardProps = {
  active: boolean;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  detail: string;
  tag: string;
  onClick: () => void;
};

function OfferCard({ active, icon, eyebrow, title, detail, tag, onClick }: OfferCardProps) {
  return (
    <button className={`offer-card ${active ? "active" : ""}`} onClick={onClick}>
      <div className="offer-icon">{icon}</div>
      <div className="offer-copy">
        <div className="offer-eyebrow">{eyebrow}</div>
        <div className="offer-title">{title}</div>
        <div className="offer-detail">{detail}</div>
      </div>
      <div className={`toggle ${active ? "on" : ""}`} aria-hidden="true">
        <span />
      </div>
      <div className="offer-tag">{active ? tag : "OFF"}</div>
    </button>
  );
}

export default App;