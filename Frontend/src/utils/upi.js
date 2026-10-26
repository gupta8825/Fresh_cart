// UPI QR helpers (frontend demo). A merchant UPI ID can be configured via
// the public env var VITE_UPI_ID. Real payment collection + verification
// always require a payment gateway and backend — this file only builds the
// QR payload/URI, never a payment confirmation.

export function getMerchantUpiId() {
  const raw = (import.meta.env?.VITE_UPI_ID || "").trim();
  // Basic VPA shape check: name@bank
  if (/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(raw)) return raw;
  return "";
}

export function buildUpiUri({ upiId, name = "FreshCart Demo", amount, ref }) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: Number(amount).toFixed(2),
    cu: "INR",
    tn: String(ref || "FreshCart demo order").slice(0, 80),
  });
  return `upi://pay?${params.toString()}`;
}

export function buildDemoPayload({ ref, amount }) {
  return [
    "FRESHCART-DEMO-PAYMENT",
    `Ref: ${ref}`,
    `Amount: INR ${Number(amount).toFixed(2)}`,
    "Demo only — scanning does not pay anyone or confirm any order.",
  ].join("\n");
}
