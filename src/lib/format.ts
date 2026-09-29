/** "12 people" / "1 person", the social-proof line on a product card. */
export function peoplePhrase(count: number) {
  return `${count} ${count === 1 ? "person" : "people"}`;
}

/** "bag" + 2 -> "2 bags". Units here are all regular plurals. */
export function unitPhrase(quantity: number, unitLabel: string) {
  return `${quantity} ${unitLabel}${quantity === 1 ? "" : "s"}`;
}

/**
 * Bubbles only mention the window once it is short enough to act on. Above
 * this the field would carry a countdown on every pool that had reached its
 * goal, which is noise rather than urgency.
 */
export const CLOSING_SOON_HOURS = 12;

/** "closes in 6h" inside the threshold, null outside it. */
export function closingSoonLabel(closesAt: string | null) {
  if (!closesAt) return null;
  const ms = new Date(closesAt).getTime() - Date.now();
  // Past the window the pool is closed and is not in the field at all.
  if (ms <= 0 || ms > CLOSING_SOON_HOURS * 3600000) return null;
  const h = Math.floor(ms / 3600000);
  return h >= 1 ? `closes in ${h}h` : `closes in ${Math.max(1, Math.round(ms / 60000))}m`;
}
