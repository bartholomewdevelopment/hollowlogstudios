/**
 * Shipping is charged once per order, based on the total number of items
 * in the cart (books, prints, merchandise — all count the same).
 *
 * Rates approximate USPS Media Mail, which is priced by weight, so the cost
 * keeps climbing past the highest tier rather than flattening out.
 *
 * IMPORTANT: this table only controls what the cart *displays*. The amount
 * actually charged is calculated by the matching table in functions/index.js.
 * Change both together, and redeploy functions, or the two will disagree.
 */
export const SHIPPING_TIERS: ReadonlyArray<{ maxItems: number; cost: number }> = [
  { maxItems: 1, cost: 4.95 },
  { maxItems: 3, cost: 7.95 },
  { maxItems: 5, cost: 9.99 },
];

/** Each item beyond the highest tier adds this much. */
export const SHIPPING_PER_EXTRA_ITEM = 1.25;

/** Cheapest possible shipping, for "from $X" copy. */
export const SHIPPING_FROM = SHIPPING_TIERS[0].cost;

export function calculateShipping(itemCount: number): number {
  if (itemCount <= 0) return 0;

  const tier = SHIPPING_TIERS.find(t => itemCount <= t.maxItems);
  if (tier) return tier.cost;

  const top = SHIPPING_TIERS[SHIPPING_TIERS.length - 1];
  const extra = itemCount - top.maxItems;
  return Math.round((top.cost + extra * SHIPPING_PER_EXTRA_ITEM) * 100) / 100;
}
