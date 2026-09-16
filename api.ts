export type TierId = "silver" | "gold" | "recliner";

export interface ApiTier {
  id: TierId;
  name: string;
  description: string;
  color: string;
  pricePaise: number;
}

export interface ApiShow {
  id: string;
  time: string;
  label: string;
  hall: string;
  totalSeats: number;
  availability: Record<TierId, number>;
}

export interface ApiState {
  tiers: ApiTier[];
  shows: ApiShow[];
}

export interface BookingResponse {
  bookingId: number;
  totals: {
    ticketLines: { tierId: TierId; quantity: number; unitPrice: number; lineTotal: number }[];
    ticketSubtotal: number;
    tickets: number;
    festivalDiscount: number;
    memberDiscount: number;
    convenienceFee: number;
    taxableAmount: number;
    gst: number;
    total: number;
  };
  updatedShow: ApiShow;
}

export interface BookingErrorResponse {
  error: string;
  tierId?: TierId;
  requested?: number;
  available?: number;
}

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw data as BookingErrorResponse;
  }
  return data as T;
}

export function fetchState(): Promise<ApiState> {
  return request<ApiState>("/state");
}

export function createBooking(payload: {
  showId: string;
  basket: Record<TierId, number>;
  festivalEnabled: boolean;
  memberEnabled: boolean;
}): Promise<BookingResponse> {
  return request<BookingResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function importPriceList(rows: { name: string; price: string }[]) {
  return request<{
    imported: unknown[];
    deduplicated: unknown[];
    rejected: unknown[];
    priceList: Record<string, number>;
  }>("/price-list/import", {
    method: "POST",
    body: JSON.stringify({ rows }),
  });
}

export function applyTierPrices(updates: Partial<Record<TierId, number>>) {
  return request<{ applied: TierId[]; tiers: ApiTier[] }>("/tiers/apply-prices", {
    method: "POST",
    body: JSON.stringify({ updates }),
  });
}
