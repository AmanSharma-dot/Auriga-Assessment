export const FESTIVAL_DISCOUNT = 15000;
export const MEMBER_RATE = 0.12;
export const MEMBER_CAP = 18000;
export const CONVENIENCE_FEE = 2200;
export const GST_RATE = 0.18;

/**
 * @param {Record<string, number>} basket tierId -> quantity
 * @param {Record<string, number>} tierPrices tierId -> price in paise
 * @param {boolean} festivalEnabled
 * @param {boolean} memberEnabled
 */
export function calculateTotals(basket, tierPrices, festivalEnabled, memberEnabled) {
  const tierIds = Object.keys(tierPrices);

  const ticketLines = tierIds
    .filter((tierId) => (basket[tierId] || 0) > 0)
    .map((tierId) => {
      const quantity = basket[tierId];
      const unitPrice = tierPrices[tierId];
      return { tierId, quantity, unitPrice, lineTotal: quantity * unitPrice };
    });

  const ticketSubtotal = ticketLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const tickets = tierIds.reduce((sum, id) => sum + (basket[id] || 0), 0);

  const festivalDiscount = festivalEnabled ? Math.min(FESTIVAL_DISCOUNT, ticketSubtotal) : 0;
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
