export const TIERS = [
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

export const RULES = {
  festivalDiscount: 15000,
  memberRate: 0.12,
  memberCap: 18000,
  convenienceFee: 2200,
  gstRate: 0.18,
};

function assertValidQuantity(value, tierId) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid quantity for ${tierId}.`);
  }
}

export function calculateQuote({ basket, availability, festivalEnabled, memberEnabled }) {
  const safeBasket = {};

  for (const tier of TIERS) {
    const quantity = Number(basket?.[tier.id] ?? 0);
    assertValidQuantity(quantity, tier.id);
    if (quantity > Number(availability?.[tier.id] ?? 0)) {
      throw new Error(`${tier.name} does not have enough seats for this booking.`);
    }
    safeBasket[tier.id] = quantity;
  }

  const ticketLines = TIERS.filter((tier) => safeBasket[tier.id] > 0).map((tier) => ({
    ...tier,
    quantity: safeBasket[tier.id],
    lineTotal: safeBasket[tier.id] * tier.price,
  }));
  const ticketSubtotal = ticketLines.reduce((total, line) => total + line.lineTotal, 0);
  const tickets = Object.values(safeBasket).reduce((total, quantity) => total + quantity, 0);
  const festivalDiscount = festivalEnabled
    ? Math.min(RULES.festivalDiscount, ticketSubtotal)
    : 0;
  const afterFestival = ticketSubtotal - festivalDiscount;
  const rawMemberDiscount = memberEnabled
    ? Math.round(afterFestival * RULES.memberRate)
    : 0;
  const memberDiscount = Math.min(rawMemberDiscount, RULES.memberCap, afterFestival);
  const convenienceFee = tickets * RULES.convenienceFee;
  const taxableAmount = afterFestival - memberDiscount + convenienceFee;
  const gst = Math.round(taxableAmount * RULES.gstRate);
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