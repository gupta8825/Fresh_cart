// Pending-checkout snapshot: carries validated checkout data from /checkout
// to /payment without creating an order. sessionStorage only (per-tab),
// no sensitive data (no card numbers/CVVs ever stored).

const KEY = "freshcart_pending_checkout";

export function savePendingCheckout(snapshot) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...snapshot, savedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}

export function loadPendingCheckout() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  try {
    sessionStorage.removeItem(KEY);
  } catch { /* ignore */ }
}
