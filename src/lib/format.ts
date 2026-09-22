/** "12 people" / "1 person", the social-proof line on a product card. */
export function peoplePhrase(count: number) {
  return `${count} ${count === 1 ? "person" : "people"}`;
}

/** "bag" + 2 -> "2 bags". Units here are all regular plurals. */
export function unitPhrase(quantity: number, unitLabel: string) {
  return `${quantity} ${unitLabel}${quantity === 1 ? "" : "s"}`;
}
