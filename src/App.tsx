import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
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

const INITIAL_BASKET: Basket = { silver: 2, gold: 1, recliner: 0 };

type PricingRules = {
  festivalDiscount: number;
  memberRate: number;
  memberCap: number;
  convenienceFee: number;
  gstRate: number;
};

type QuoteLine = Tier & {
  quantity: number;
  lineTotal: number;
};

type Quote = {
  ticketLines: QuoteLine[];
  ticketSubtotal: number;
  tickets: number;
  festivalDiscount: number;
  memberDiscount: number;
  convenienceFee: number;
  taxableAmount: number;
  gst: number;
  total: number;
};

const DEFAULT_RULES: PricingRules = {
  festivalDiscount: 15000,
  memberRate: 0.12,
  memberCap: 18000,
  convenienceFee: 2200,
  gstRate: 0.18,
};

const EMPTY_TOTALS: Quote = {
  ticketLines: [],
  ticketSubtotal: 0,
  tickets: 0,
  festivalDiscount: 0,
  memberDiscount: 0,
  convenienceFee: 0,
  taxableAmount: 0,
  gst: 0,
  total: 0,
};

function formatMoney(paise: number, showDecimals = true) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(paise / 100);
}

function App() {
  const [selectedShowId, setSelectedShowId] = useState("early");
  const [basket, setBasket] = useState<Basket>(INITIAL_BASKET);
  const [festivalEnabled, setFestivalEnabled] = useState(true);
  const [memberEnabled, setMemberEnabled] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [tiers, setTiers] = useState<Tier[]>(TIERS);
  const [pricingRules, setPricingRules] = useState<PricingRules>(DEFAULT_RULES);
  const [totals, setTotals] = useState<Quote>(EMPTY_TOTALS);
  const appRef = useRef<HTMLElement>(null);

  const selectedShow = shows.find((show) => show.id === selectedShowId) ?? null;

  useEffect(() => {
    let active = true;
    async function loadCounterData() {
      try {
        const [configResponse, showsResponse] = await Promise.all([
          fetch("/api/config"),
          fetch("/api/shows"),
        ]);
        if (!configResponse.ok || !showsResponse.ok) {
          throw new Error("Could not load live counter data.");
        }
        const config = await configResponse.json();
        const nextShows: Show[] = await showsResponse.json();
        if (!active) return;
        setTiers(config.tiers);
        setPricingRules(config.rules);
        setShows(nextShows);
        setSelectedShowId((current) =>
          nextShows.some((show) => show.id === current) ? current : nextShows[0]?.id ?? "",
        );
        setIsLoading(false);
      } catch (error) {
        if (!active) return;
        setApiError(error instanceof Error ? error.message : "Could not load live counter data.");
        setIsLoading(false);
      }
    }
    loadCounterData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedShowId) return;
    let active = true;
    async function loadQuote() {
      try {
        const response = await fetch("/api/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            showId: selectedShowId,
            basket,
            festivalEnabled,
            memberEnabled,
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not calculate the quote.");
        if (active) {
          setTotals(payload);
          setApiError(null);
        }
      } catch (error) {
        if (active) {
          setApiError(error instanceof Error ? error.message : "Could not calculate the quote.");
        }
      }
    }
    loadQuote();
    return () => {
      active = false;
    };
  }, [selectedShowId, basket, festivalEnabled, memberEnabled]);

  useEffect(() => {
    if (!appRef.current || !shows.length) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        ".show-progress span",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.8, stagger: 0.08, ease: "power2.out" },
      );
      gsap.fromTo(
        ".summary-card",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
      );
    }, appRef.current);
    return () => context.revert();
  }, [shows, selectedShowId]);

  useEffect(() => {
    if (!appRef.current || totals.total === 0) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        ".total-row strong",
        { scale: 0.94, color: "#70c6bb" },
        { scale: 1, color: "#f5fbf9", duration: 0.42, ease: "back.out(1.7)" },
      );
    }, appRef.current);
    return () => context.revert();
  }, [totals.total]);

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
        Math.min(current[tierId] + delta, selectedShow?.availability[tierId] ?? 0),
      );
      return { ...current, [tierId]: nextValue };
    });
  }

  function resetBooking() {
    setBasket({ silver: 0, gold: 0, recliner: 0 });
    setFestivalEnabled(false);
    setMemberEnabled(false);
    setShowReceipt(false);
    setBookingId(null);
    setApiError(null);
  }

  async function confirmBooking() {
    if (!selectedShow || totals.tickets === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: selectedShow.id,
          basket,
          festivalEnabled,
          memberEnabled,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not save the booking.");
      const showsResponse = await fetch("/api/shows");
      if (showsResponse.ok) setShows(await showsResponse.json());
      setBookingId(payload.id);
      setShowReceipt(true);
      setApiError(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Could not save the booking.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.main
      ref={appRef}
      className="app-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <motion.header
        className="topbar"
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
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
      </motion.header>

      <div className="page-wrap">
        <motion.div
          className="page-heading"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.16, duration: 0.55, ease: "easeOut" }}
        >
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
              <span className={`sync-dot ${apiError ? "sync-error" : ""}`} />
              {apiError || (isLoading ? "Loading live inventory…" : "Live inventory synced")}
            </div>
          </div>
        </motion.div>

        <div className="workspace-grid">
          <motion.section
            className="booking-column"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.6, ease: "easeOut" }}
          >
            <div className="section-label">
              <span className="section-number">01</span>
              <div>
                <h2>Choose a show</h2>
                <p>Live seat availability by showtime</p>
              </div>
            </div>

            <div className="show-grid">
              {isLoading && <div className="data-state">Loading live showtimes…</div>}
              {!isLoading && shows.length === 0 && (
                <div className="data-state">No live showtimes available.</div>
              )}
              {shows.map((show) => {
                const isSelected = show.id === selectedShowId;
                const availableSeats = Object.values(show.availability).reduce(
                  (sum, count) => sum + count,
                  0,
                );
                return (
                  <motion.button
                    key={show.id}
                    className={`show-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setShow(show)}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.28 + shows.indexOf(show) * 0.06, duration: 0.4 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.985 }}
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
                  </motion.button>
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
              {tiers.map((tier) => {
                const available = selectedShow?.availability[tier.id] ?? 0;
                const quantity = basket[tier.id];
                const soldOut = available === 0;
                return (
                  <motion.div
                    className={`tier-row ${soldOut ? "sold-out" : ""}`}
                    key={tier.id}
                    initial={{ x: -8, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + tiers.indexOf(tier) * 0.06, duration: 0.38 }}
                  >
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
                  </motion.div>
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
                detail={`Save ${formatMoney(pricingRules.festivalDiscount)} on this booking`}
                tag="AUTO-APPLIED"
                onClick={() => setFestivalEnabled((value) => !value)}
              />
              <OfferCard
                active={memberEnabled}
                icon={<BadgeCheck size={17} />}
                eyebrow="OFFER 02"
                title="Auriga member"
                detail={`${Math.round(pricingRules.memberRate * 100)}% off · capped at ${formatMoney(pricingRules.memberCap)}`}
                tag="MEMBER"
                onClick={() => setMemberEnabled((value) => !value)}
              />
            </div>

            <div className="calculation-note">
              <Info size={16} />
              <span>GST is calculated on the discounted ticket value plus the convenience fee.</span>
            </div>
          </motion.section>

          <motion.aside
            className="summary-column"
            initial={{ x: 16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.65, ease: "easeOut" }}
          >
            <motion.div
              className="summary-card"
              layout
              transition={{ layout: { duration: 0.3, ease: "easeOut" } }}
            >
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
                    {selectedShow?.time ?? "—"} <span>·</span> {selectedShow?.hall ?? "—"}
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
                disabled={totals.tickets === 0 || isSubmitting || !selectedShow}
                onClick={confirmBooking}
              >
                <CreditCard size={17} />
                {isSubmitting ? "Saving booking…" : "Confirm booking"}
                <ArrowUpRight size={16} />
              </button>
              <div className="secure-note">
                <ShieldCheck size={14} />
                Exact paisa calculation · No hidden charges
              </div>
            </motion.div>

            <div className="audit-card">
              <div className="audit-icon"><Check size={15} strokeWidth={2.5} /></div>
              <div>
                <strong>Pricing checks passed</strong>
                <p>All discounts, fees, and tax reconcile to the final total.</p>
              </div>
              <ArrowDownRight size={15} className="audit-arrow" />
            </div>
          </motion.aside>
        </div>
      </div>

      <AnimatePresence>
      {showReceipt && (
        <motion.div
          className="toast"
          role="status"
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="toast-icon"><Check size={16} /></div>
          <div>
            <strong>Booking ready to collect</strong>
            <span>{bookingId ?? "Saved"} · {totals.tickets} tickets · {formatMoney(totals.total)}</span>
          </div>
          <button onClick={() => setShowReceipt(false)} aria-label="Dismiss confirmation">×</button>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.main>
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