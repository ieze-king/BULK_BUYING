/**
 * Nigerian mobile number handling.
 *
 * The pilot does not verify numbers by OTP (that costs money per message), so
 * format validation plus dedupe is the only guard on the one asset this pilot
 * produces: a callable contact list.
 */

/** Valid mobile prefixes after the 234 country code: 70x, 71x, 80x, 81x, 90x, 91x. */
const NG_MOBILE = /^(7[01]|8[01]|9[01])\d{8}$/;

/** Returns E.164-without-plus (e.g. "2348031234567"), or null if not a valid NG mobile. */
export function normalizeNgPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  let local: string;
  if (digits.length === 13 && digits.startsWith("234")) {
    local = digits.slice(3);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    local = digits.slice(1);
  } else if (digits.length === 10) {
    local = digits;
  } else {
    return null;
  }

  return NG_MOBILE.test(local) ? `234${local}` : null;
}

/** "2348031234567" -> "0803 123 4567", for confirm-your-number display. */
export function formatNgPhone(normalized: string): string {
  const local = normalized.startsWith("234") ? normalized.slice(3) : normalized;
  if (local.length !== 10) return normalized;
  return `0${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}
