export const COUPONS = {
  FRESH10: { code: "FRESH10", type: "pct", value: 10, maxOff: 150, minOrder: 299, label: "10% off up to ₹150 (min ₹299)", active: true, expiry: "", usageLimit: "", used: 0 },
  WELCOME50: { code: "WELCOME50", type: "flat", value: 50, minOrder: 499, label: "₹50 off orders above ₹499", active: true, expiry: "", usageLimit: "", used: 0 },
};

// --- Admin demo persistence: merge persisted coupon edits into the live
// exported map so checkout uses the same data as coupon management.
try {
  const raw = localStorage.getItem("freshcart_coupons");
  if (raw) {
    const stored = JSON.parse(raw);
    if (stored && typeof stored === "object") {
      Object.keys(COUPONS).forEach((k) => delete COUPONS[k]);
      Object.assign(COUPONS, stored);
    }
  }
} catch { /* never break checkout */ }

export const FREE_DELIVERY_THRESHOLD = 499;
export const STANDARD_DELIVERY_FEE = 39;
export const EXPRESS_DELIVERY_FEE = 79;

export function isCouponUsable(coupon) {
  if (!coupon) return false;
  if (coupon.active === false) return false;
  if (coupon.expiry && !Number.isNaN(Date.parse(coupon.expiry))) {
    if (new Date(coupon.expiry).getTime() < Date.now()) return false;
  }
  if (coupon.usageLimit !== "" && coupon.usageLimit != null) {
    if ((Number(coupon.used) || 0) >= Number(coupon.usageLimit)) return false;
  }
  return true;
}

export function cartTotals(items, products, couponCode = null, deliveryFee = 0) {
  let mrp = 0;
  let subtotal = 0;
  items.forEach((ci) => {
    const p = products.find((x) => x.id === ci.id);
    if (!p) return;
    mrp += (p.originalPrice || p.price) * ci.qty;
    subtotal += p.price * ci.qty;
  });
  const discount = Math.max(0, mrp - subtotal);
  let couponOff = 0;
  const coupon = couponCode ? COUPONS[couponCode] : null;
  if (coupon && isCouponUsable(coupon) && subtotal >= (coupon.minOrder || 0)) {
    if (coupon.type === "pct") {
      couponOff = Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxOff || Infinity);
    } else {
      couponOff = Math.min(coupon.value, subtotal);
    }
  }
  const delivery = subtotal === 0 ? 0 : deliveryFee;
  const total = Math.max(0, subtotal - couponOff + delivery);
  return { mrp, subtotal, discount, couponOff, delivery, total, coupon };
}
