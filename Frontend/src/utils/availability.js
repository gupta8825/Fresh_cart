// Single source of truth for product availability (Prompt 14).
// Statuses:
// - "unavailable" — manually marked inactive (active === false), even if stock > 0
// - "out"         — stock is 0 (or missing/invalid and not purchasable)
// - "low"         — 1..threshold units (default threshold 10)
// - "in"          — above threshold
// Products stay visible everywhere; only purchase actions are gated.

import { getLowStockThreshold } from "./demoStore";

export const LOW_STOCK_DEFAULT = 10;

export function getStock(product) {
  const s = Number(product?.stock);
  if (!Number.isFinite(s) || s < 0) return 0;
  return Math.floor(s);
}

export function isActive(product) {
  if (!product) return false;
  return product.active !== false;
}

function thresholdOf(override) {
  if (Number.isFinite(Number(override)) && Number(override) > 0) return Math.floor(Number(override));
  try {
    return getLowStockThreshold();
  } catch {
    return LOW_STOCK_DEFAULT;
  }
}

export function getAvailability(product, thresholdOverride) {
  const threshold = thresholdOf(thresholdOverride);
  if (!isActive(product)) {
    return { key: "unavailable", label: "Currently Unavailable", stock: getStock(product), purchasable: false };
  }
  const stock = getStock(product);
  if (stock <= 0) {
    return { key: "out", label: "Out of Stock", stock, purchasable: false };
  }
  if (stock <= threshold) {
    return { key: "low", label: "Low Stock", stock, purchasable: true };
  }
  return { key: "in", label: "In Stock", stock, purchasable: true };
}

export function isPurchasable(product, thresholdOverride) {
  return getAvailability(product, thresholdOverride).purchasable;
}

// Validate cart lines against live shared catalog data.
// Returns issues: [{ id, name, type: 'unavailable'|'exceeds', qty, stock }]
// Never mutates the cart — callers decide (warn / block), never silently remove.
export function validateCartItems(lines) {
  const issues = [];
  (lines || []).forEach(({ product, qty }) => {
    if (!product) return;
    const a = getAvailability(product);
    if (!a.purchasable) {
      issues.push({ id: product.id, name: product.name, type: "unavailable", qty, stock: a.stock, label: a.label });
    } else if (qty > a.stock) {
      issues.push({ id: product.id, name: product.name, type: "exceeds", qty, stock: a.stock, label: a.label });
    }
  });
  return issues;
}
