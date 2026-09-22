export function naira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

/** "bag" + 2 -> "2 bags". Units here are all regular plurals. */
export function unitPhrase(quantity: number, unitLabel: string) {
  return `${quantity} ${unitLabel}${quantity === 1 ? "" : "s"}`;
}
