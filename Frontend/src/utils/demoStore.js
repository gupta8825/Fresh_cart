// ---------------------------------------------------------------------------
// FreshCart shared frontend demo-data layer (no backend, localStorage only).
// Single source of truth for admin + storefront: products, categories,
// coupons, orders, customers, settings, activity. All labels must call this
// "demo" data in the UI. Never store passwords, card numbers, or tokens here.
// ---------------------------------------------------------------------------

// ---------- safe storage ----------
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const v = JSON.parse(raw);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch { /* ignore */ }
}

// ---------- reactivity across tabs/pages ----------
const EVT = "freshcart:demo-update";
export function notify(scope = "all") {
  try {
    window.dispatchEvent(new CustomEvent(EVT, { detail: scope }));
  } catch { /* ignore */ }
}

import { useEffect, useState } from "react";
export function useDemoVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const bump = () => setV((x) => x + 1);
    window.addEventListener(EVT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(EVT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);
  return v;
}

// ---------- storage keys ----------
const K = {
  productOverrides: "freshcart_product_overrides",
  customProducts: "freshcart_custom_products",
  deletedProducts: "freshcart_deleted_products",
  categoryOverrides: "freshcart_category_overrides",
  customCategories: "freshcart_custom_categories",
  deletedCategories: "freshcart_deleted_categories",
  coupons: "freshcart_coupons",
  orders: "freshcart_orders",
  activity: "freshcart_activity",
  settings: "freshcart_settings",
  stockLedger: "freshcart_stock_ledger",
};

// ---------- products ----------
export const SEED_COUPONS_FALLBACK = ["FRESH10", "WELCOME50"];

// Merge seed list with persisted admin changes. Pure (no mutation).
export function mergeProducts(seed, { overrides = {}, custom = [], deleted = [] } = {}) {
  const del = new Set(deleted);
  const list = seed.filter((p) => !del.has(p.id)).map((p) => (overrides[p.id] ? { ...p, ...overrides[p.id] } : p));
  custom.forEach((p) => {
    if (!del.has(p.id)) list.push({ ...p });
  });
  return list;
}

export function loadProductDeltas() {
  return {
    overrides: readJSON(K.productOverrides, {}),
    custom: readJSON(K.customProducts, []),
    deleted: readJSON(K.deletedProducts, []),
  };
}

// Apply persisted deltas INTO the live exported PRODUCTS array so every
// existing storefront consumer (which imports PRODUCTS directly) sees admin
// edits without code changes. Called once from data/products.js on load.
export function hydrateProducts(live, seed) {
  const { overrides, custom, deleted } = loadProductDeltas();
  const merged = mergeProducts(seed, { overrides, custom, deleted });
  live.length = 0;
  merged.forEach((p) => live.push(p));
}

export function saveProduct(product) {
  const isCustomSeed = !/^p\d+$/.test(product.id);
  if (isCustomSeed) {
    const custom = readJSON(K.customProducts, []).filter((p) => p.id !== product.id);
    writeJSON(K.customProducts, [...custom, { ...product }]);
  } else {
    const overrides = readJSON(K.productOverrides, {});
    overrides[product.id] = { ...product };
    writeJSON(K.productOverrides, overrides);
  }
  notify("products");
}

export function deleteProductById(id, seedIds = []) {
  // Never allow deleting the entire catalogue.
  const remaining = currentProductCountGuess() - 1;
  if (remaining < 1) return { ok: false, error: "Refusing to delete the last demo product." };
  const custom = readJSON(K.customProducts, []).filter((p) => p.id !== id);
  writeJSON(K.customProducts, custom);
  const overrides = readJSON(K.productOverrides, {});
  delete overrides[id];
  writeJSON(K.productOverrides, overrides);
  if (seedIds.includes(id)) {
    const deleted = readJSON(K.deletedProducts, []);
    if (!deleted.includes(id)) writeJSON(K.deletedProducts, [...deleted, id]);
  }
  notify("products");
  return { ok: true };
}

function currentProductCountGuess() {
  return readJSON(K.customProducts, []).length + 26 - readJSON(K.deletedProducts, []).length;
}

// NOTE: data/products.js imports this module and calls hydrate* at load.
// The reverse import below is only dereferenced inside functions (never at
// module top level), so the cycle is safe.
import { PRODUCTS as SEED_LIVE } from "../data/products.js";

export function adjustStock(id, delta, reason = "") {
  const { overrides, custom, deleted } = loadProductDeltas();
  const all = mergeProducts([], { overrides: {}, custom: [], deleted: [] }); // placeholder (unused)
  void all;
  const customList = readJSON(K.customProducts, []);
  const foundCustom = customList.find((p) => p.id === id);
  let nextStock = null;
  if (foundCustom) {
    nextStock = Math.max(0, (Number(foundCustom.stock) || 0) + delta);
    writeJSON(K.customProducts, customList.map((p) => (p.id === id ? { ...p, stock: nextStock } : p)));
  } else {
    const ov = readJSON(K.productOverrides, {});
    let base = Number(ov[id]?.stock);
    if (!Number.isFinite(base)) {
      // No override yet: start from the live seed stock, not zero.
      const seed = SEED_LIVE.find((p) => p.id === id);
      base = Number(seed?.stock);
    }
    // base may still be unknown; caller passes resolved product.
    nextStock = Math.max(0, (Number.isFinite(base) ? base : 0) + delta);
    ov[id] = { ...(ov[id] || {}), stock: nextStock };
    writeJSON(K.productOverrides, ov);
  }
  const ledger = readJSON(K.stockLedger, []);
  ledger.unshift({ id, delta, reason: reason || "Manual adjustment (demo)", date: new Date().toISOString() });
  writeJSON(K.stockLedger, ledger.slice(0, 100));
  notify("products");
  return nextStock;
}

// Set stock and/or active flag for one product (admin inventory action).
// Merges into persisted override layers so the storefront updates via the
// existing shared state + hydration. Never negative stock.
export function setProductAvailability(id, { stock, active } = {}) {
  if (!id) return { ok: false, error: "Missing product id." };
  const customList = readJSON(K.customProducts, []);
  if (customList.some((p) => p.id === id)) {
    writeJSON(K.customProducts, customList.map((p) => {
      if (p.id !== id) return p;
      const next = { ...p };
      if (stock !== undefined) next.stock = Math.max(0, Math.floor(Number(stock) || 0));
      if (active !== undefined) next.active = active !== false;
      return next;
    }));
  } else {
    const ov = readJSON(K.productOverrides, {});
    const next = { ...(ov[id] || {}) };
    if (stock !== undefined) next.stock = Math.max(0, Math.floor(Number(stock) || 0));
    if (active !== undefined) next.active = active !== false;
    ov[id] = next;
    writeJSON(K.productOverrides, ov);
  }
  const ledger = readJSON(K.stockLedger, []);
  ledger.unshift({
    id, delta: 0, reason: `Availability set: stock=${stock ?? "—"}, active=${active ?? "—"} (demo)`,
    date: new Date().toISOString(),
  });
  writeJSON(K.stockLedger, ledger.slice(0, 100));
  logActivity("inventory", `Demo availability updated for ${id} (stock=${stock ?? "—"}, active=${active ?? "—"})`);
  notify("products");
  return { ok: true };
}

// Resolve a product's live active flag from persisted layers.
export function resolveActive(seedItem) {
  if (!seedItem) return false;
  const custom = readJSON(K.customProducts, []).find((p) => p.id === seedItem.id);
  if (custom) return custom.active !== false;
  const ov = readJSON(K.productOverrides, {})[seedItem.id];
  if (ov && ov.active !== undefined) return ov.active !== false;
  return seedItem.active !== false;
}

// Availability filter helper for listings / future admin tables.
export function filterByAvailability(list, key, threshold) {
  if (!key || key === "all") return list;
  const th = Number(threshold);
  const lim = Number.isFinite(th) && th > 0 ? Math.floor(th) : 10;
  return (list || []).filter((p) => {
    const active = p.active !== false;
    const stock = Math.floor(Number(p?.stock) || 0);
    if (key === "unavailable") return !active;
    if (!active) return false;
    if (key === "out") return stock <= 0;
    if (key === "low") return stock > 0 && stock <= lim;
    if (key === "in") return stock > lim;
    return true;
  });
}

// Resolve a product's live stock from persisted layers given the seed item.
export function resolveStock(seedItem) {
  if (!seedItem) return 0;
  const custom = readJSON(K.customProducts, []).find((p) => p.id === seedItem.id);
  if (custom) return Number(custom.stock) || 0;
  const ov = readJSON(K.productOverrides, {})[seedItem.id];
  if (ov && ov.stock != null) return Number(ov.stock) || 0;
  return Number(seedItem.stock) || 0;
}

// ---------- categories ----------
export function mergeCategories(seed, { overrides = {}, custom = [], deleted = [] } = {}) {
  const del = new Set(deleted);
  const list = seed.filter((c) => !del.has(c.id)).map((c) => (overrides[c.id] ? { ...c, ...overrides[c.id] } : c));
  custom.forEach((c) => {
    if (!del.has(c.id)) list.push({ ...c });
  });
  return list;
}

export function loadCategoryDeltas() {
  return {
    overrides: readJSON(K.categoryOverrides, {}),
    custom: readJSON(K.customCategories, []),
    deleted: readJSON(K.deletedCategories, []),
  };
}

export function hydrateCategories(live, seed) {
  const merged = mergeCategories(seed, loadCategoryDeltas());
  live.length = 0;
  merged.forEach((c) => live.push(c));
}

export function saveCategory(cat) {
  if (/^[a-z]+$/.test(cat.id) && cat.seed) {
    const overrides = readJSON(K.categoryOverrides, {});
    overrides[cat.id] = { ...cat };
    writeJSON(K.categoryOverrides, overrides);
  } else {
    const custom = readJSON(K.customCategories, []).filter((c) => c.id !== cat.id);
    writeJSON(K.customCategories, [...custom, { ...cat }]);
  }
  notify("categories");
}

export function deleteCategoryById(id, seedIds = []) {
  const custom = readJSON(K.customCategories, []).filter((c) => c.id !== id);
  writeJSON(K.customCategories, custom);
  const overrides = readJSON(K.categoryOverrides, {});
  delete overrides[id];
  writeJSON(K.categoryOverrides, overrides);
  if (seedIds.includes(id)) {
    const deleted = readJSON(K.deletedCategories, []);
    if (!deleted.includes(id)) writeJSON(K.deletedCategories, [...deleted, id]);
  }
  notify("categories");
}

// ---------- coupons (shared with checkout pricing) ----------
export const SEED_COUPONS = {
  FRESH10: { code: "FRESH10", type: "pct", value: 10, maxOff: 150, minOrder: 299, label: "10% off up to ₹150 (min ₹299)", active: true, expiry: "", usageLimit: "", used: 0 },
  WELCOME50: { code: "WELCOME50", type: "flat", value: 50, minOrder: 499, label: "₹50 off orders above ₹499", active: true, expiry: "", usageLimit: "", used: 0 },
};

export function loadCouponMap() {
  const stored = readJSON(K.coupons, null);
  if (!stored) return { ...SEED_COUPONS };
  return stored;
}

// Mutate the live exported COUPONS object in place (storefront reads it).
export function hydrateCoupons(live) {
  const map = loadCouponMap();
  Object.keys(live).forEach((k) => delete live[k]);
  Object.assign(live, map);
}

export function saveCoupon(coupon) {
  const map = loadCouponMap();
  map[coupon.code] = { ...coupon };
  writeJSON(K.coupons, map);
  notify("coupons");
}

export function deleteCouponByCode(code) {
  const map = loadCouponMap();
  delete map[code];
  writeJSON(K.coupons, map);
  notify("coupons");
}

export function validateCouponShape(c, existingCodes = []) {
  const e = {};
  const code = String(c.code || "").trim().toUpperCase();
  if (!code) e.code = "Coupon code is required.";
  else if (!/^[A-Z0-9]{3,16}$/.test(code)) e.code = "Use 3–16 letters/digits (demo).";
  else if (existingCodes.includes(code)) e.code = "This code already exists (case-insensitive).";
  if (!(Number(c.value) > 0)) e.value = "Discount value must be positive.";
  if (c.type === "pct" && Number(c.value) > 100) e.value = "Percentage cannot exceed 100%.";
  if (Number(c.minOrder) < 0) e.minOrder = "Minimum order cannot be negative.";
  if (c.expiry && Number.isNaN(Date.parse(c.expiry))) e.expiry = "Invalid expiry date.";
  if (c.usageLimit !== "" && c.usageLimit != null && !(Number(c.usageLimit) > 0)) e.usageLimit = "Usage limit must be positive or empty.";
  return e;
}

// ---------- orders ----------
export function getOrders() {
  const raw = readJSON(K.orders, []);
  return Array.isArray(raw) ? raw : [];
}

export function saveOrders(list) {
  writeJSON(K.orders, list);
  notify("orders");
}

export const ORDER_STATUSES = ["Pending", "Accepted", "Processing", "Ready for Pickup", "Out for Delivery", "Shipped", "Delivered", "Rejected", "Cancelled"];

// Allowed forward flow. Rejected/Cancelled are terminal except an explicit
// reset back to Processing (demo convenience, logged in history).
const TRANSITIONS = {
  Pending: ["Accepted", "Rejected", "Cancelled"],
  Accepted: ["Processing", "Rejected", "Cancelled"],
  Processing: ["Ready for Pickup", "Cancelled"],
  "Ready for Pickup": ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered"],
  Shipped: ["Out for Delivery", "Delivered"],
  Delivered: [],
  Rejected: ["Processing"],
  Cancelled: ["Processing"], // explicit reset only
};

export function allowedTransitions(status) {
  return TRANSITIONS[status] || [];
}

// Canonical demo status for any stored order (old + new lifecycle).
export function demoStatusOf(o) {
  const s = String(o?.status || "Processing");
  if (/reject/i.test(s)) return "Rejected";
  if (/cancel/i.test(s)) return "Cancelled";
  if (/out for delivery/i.test(s)) return "Out for Delivery";
  if (/ready/i.test(s)) return "Ready for Pickup";
  if (/accept/i.test(s)) return "Accepted";
  if (/deliver/i.test(s)) return "Delivered";
  if (/ship/i.test(s)) return "Shipped";
  if (/pend/i.test(s)) return "Pending";
  if (/confirm/i.test(s)) return "Processing";
  return ORDER_STATUSES.includes(s) ? s : "Processing";
}

// Customer-facing one-liners per canonical status (demo wording).
export function customerStatusMessage(status) {
  switch (demoStatusOf({ status })) {
    case "Pending": return "Order received — waiting for store confirmation.";
    case "Accepted": return "Order accepted — the store will pack your items.";
    case "Processing": return "Preparing your items.";
    case "Ready for Pickup": return "Ready for pickup — packed and waiting.";
    case "Out for Delivery": return "Out for delivery — rider is on the way.";
    case "Shipped": return "Shipped — on its way to you.";
    case "Delivered": return "Delivered — enjoy your groceries!";
    case "Rejected": return "Not accepted by the store — no payment was collected.";
    case "Cancelled": return "Cancelled — no payment was collected.";
    default: return "Processing your order.";
  }
}

// Central order creation: single shape, unique ref, status history.
// paymentStatus is recorded explicitly and NEVER inferred from order status.
export function createOrder({ items = [], totals = {}, coupon = null, address = {}, delivery = {}, payment = "Cash on Delivery", paymentStatus = "Pending", source = "storefront" }) {
  const ref = `FC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
  const now = new Date().toISOString();
  const order = {
    ref,
    date: now,
    items: items.map((it) => ({ ...it })),
    totals: { ...totals },
    coupon,
    address: { ...address },
    customerEmail: String(address?.email || "").toLowerCase(),
    delivery: { ...delivery },
    payment,
    paymentStatus,
    paymentTxn: null, // only set when a real gateway reference exists (never in demo)
    status: "Pending",
    source,
    history: [{ status: "Pending", at: now, note: "Order received (demo)." }],
  };
  const prev = getOrders();
  if (prev.some((o) => o.ref === ref)) return createOrder({ items, totals, coupon, address, delivery, payment, paymentStatus, source });
  saveOrders([order, ...prev]);
  notifyNewOrder(order);
  logActivity("order", `Demo order ${ref} created (${payment}, ${paymentStatus})`);
  return order;
}

export function getOrderByRef(ref) {
  return getOrders().find((o) => o.ref === ref) || null;
}

// Orders visible to one customer: exact email match, plus legacy orders
// that carry no email (grandfathered demo data on this device).
export function getOrdersForEmail(email) {
  const norm = String(email || "").trim().toLowerCase();
  return getOrders().filter((o) => {
    const em = String(o.customerEmail || o.address?.email || "").toLowerCase();
    if (!em) return true;
    return norm ? em === norm : true;
  });
}

export function updateOrderStatus(ref, next, { reason = "" } = {}) {
  const list = getOrders();
  const idx = list.findIndex((o) => o.ref === ref);
  if (idx === -1) return { ok: false, error: "Order not found." };
  const cur = demoStatusOf(list[idx]);
  if (cur !== next && !(allowedTransitions(cur) || []).includes(next)) {
    return { ok: false, error: `Cannot move a ${cur} demo order to ${next}.` };
  }
  const at = new Date().toISOString();
  const history = [...(list[idx].history || []), { status: next, at, note: reason || `Moved to ${next} (demo).` }];
  list[idx] = { ...list[idx], status: next, history };
  saveOrders(list);
  logActivity("order", `Demo order ${ref} moved to ${next}${reason ? ` — ${reason}` : ""}`);
  return { ok: true };
}

// Payment status is tracked SEPARATELY from order status. Accepting an order
// never marks it paid; COD stays unpaid until collection is recorded.
export const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

export function setPaymentStatus(ref, next, { note = "" } = {}) {
  if (!PAYMENT_STATUSES.includes(next)) return { ok: false, error: "Unknown payment status." };
  const list = getOrders();
  const idx = list.findIndex((o) => o.ref === ref);
  if (idx === -1) return { ok: false, error: "Order not found." };
  const at = new Date().toISOString();
  const history = [...(list[idx].history || []), { status: list[idx].status, paymentStatus: next, at, note: note || `Payment marked ${next} (demo).` }];
  list[idx] = { ...list[idx], paymentStatus: next, history };
  saveOrders(list);
  logActivity("order", `Demo order ${ref} payment marked ${next}`);
  return { ok: true };
}

// ---------- order notifications (in-app, demo) ----------
// Linked to order refs so the same order never alerts twice.
export function getNotifications() {
  const raw = readJSON("freshcart_notifications", []);
  return Array.isArray(raw) ? raw : [];
}

function saveNotifications(list) {
  writeJSON("freshcart_notifications", list.slice(0, 100));
  notify("notifications");
}

export function notifyNewOrder(order) {
  const list = getNotifications();
  if (list.some((n) => n.orderRef === order.ref)) return list;
  const entry = {
    id: `n-${order.ref}`,
    orderRef: order.ref,
    text: `New Order Received — Order #${order.ref}`,
    date: order.date,
    read: false,
  };
  saveNotifications([entry, ...list]);
  return [entry, ...list];
}

export function markNotificationRead(id) {
  saveNotifications(getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export function markAllNotificationsRead() {
  saveNotifications(getNotifications().map((n) => ({ ...n, read: true })));
}

export function getUnreadCount() {
  return getNotifications().filter((n) => !n.read).length;
}

// "New" highlighting: orders placed after the admin last opened the list.
export function getAdminSeenAt() {
  return Number(readJSON("freshcart_admin_seen_at", 0)) || 0;
}

export function markAdminSeen() {
  writeJSON("freshcart_admin_seen_at", Date.now());
}

export function isNewOrder(o) {
  try {
    return new Date(o.date).getTime() > getAdminSeenAt();
  } catch {
    return false;
  }
}

// Optional new-order sound (opt-in, default off — autoplay-safe).
export function getSoundPref() {
  return readJSON("freshcart_admin_sound", false) === true;
}

export function setSoundPref(on) {
  writeJSON("freshcart_admin_sound", !!on);
}

export function playNewOrderBeep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
    return true;
  } catch {
    return false;
  }
}

// ---------- customers (derived demo data) ----------
const SAMPLE_CUSTOMERS = [
  { id: "c-01", name: "Priya Sharma", email: "priya@example.com", phone: "9812345678", joined: "2025-06-02T10:00:00.000Z", sample: true },
  { id: "c-02", name: "Rahul Verma", email: "rahul@example.com", phone: "9912345678", joined: "2025-08-14T10:00:00.000Z", sample: true },
  { id: "c-03", name: "Ananya Iyer", email: "ananya@example.com", phone: "9811122233", joined: "2025-11-03T10:00:00.000Z", sample: true },
];

export function getCustomers() {
  const users = readJSON("freshcart_demo_users", []);
  const orders = getOrders();
  const map = new Map();
  SAMPLE_CUSTOMERS.forEach((c) => map.set(c.email.toLowerCase(), { ...c, orders: 0, spent: 0, lastOrder: null }));
  users.forEach((u) => {
    const k = String(u.email || "").toLowerCase();
    if (!k || map.has(k)) return;
    map.set(k, { id: u.id, name: u.name, email: u.email, phone: u.phone || "—", joined: u.joined, sample: false, orders: 0, spent: 0, lastOrder: null });
  });
  orders.forEach((o) => {
    const email = String(o.address?.email || o.customerEmail || "").toLowerCase();
    const name = o.address?.name || o.customerName || "Guest (demo)";
    const k = email || `guest:${name.toLowerCase()}`;
    if (!map.has(k)) {
      map.set(k, { id: k, name, email: email || "—", phone: o.address?.phone || "—", joined: o.date, sample: false, orders: 0, spent: 0, lastOrder: null });
    }
    const c = map.get(k);
    c.orders += 1;
    c.spent += Number(o.totals?.total) || 0;
    if (!c.lastOrder || new Date(o.date) > new Date(c.lastOrder)) c.lastOrder = o.date;
  });
  return [...map.values()];
}

// ---------- settings ----------
export const DEFAULT_SETTINGS = {
  store: {
    name: "FreshCart",
    email: "hello@freshcart.demo",
    phone: "+91 98765 43210",
    address: "123 Green Street, Mumbai 400001 (demo)",
    description: "Everyday kirana essentials delivered fast. Demo storefront.",
    currency: "INR",
    announcement: "Fresh groceries delivered to your door — FREE delivery over ₹499",
    // Demo admin WhatsApp config (UPDATE prompt): separate fields, empty = not configured.
    adminWhatsapp: { countryCode: "IN", dialCode: "+91", phoneNumber: "" },
  },
  delivery: { standardFee: 39, expressFee: 79, freeThreshold: 499, standardEta: "2–4 hours", expressEta: "60 minutes" },
  inventory: { lowStockThreshold: 10, showOutOfStock: true },
  prefs: { maintenance: false },
};

export function getSettings() {
  const s = readJSON(K.settings, null);
  if (!s) return structuredCloneFallback(DEFAULT_SETTINGS);
  return {
    store: { ...DEFAULT_SETTINGS.store, ...(s.store || {}) },
    delivery: { ...DEFAULT_SETTINGS.delivery, ...(s.delivery || {}) },
    inventory: { ...DEFAULT_SETTINGS.inventory, ...(s.inventory || {}) },
    prefs: { ...DEFAULT_SETTINGS.prefs, ...(s.prefs || {}) },
  };
}

function structuredCloneFallback(o) {
  return JSON.parse(JSON.stringify(o));
}

export function saveSettings(s) {
  writeJSON(K.settings, s);
  notify("settings");
}

export function resetSettings() {
  removeKey(K.settings);
  notify("settings");
}

export function getFeeConfig() {
  const d = getSettings().delivery;
  return {
    freeThreshold: Number(d.freeThreshold) || 0,
    standardFee: Number(d.standardFee) || 0,
    expressFee: Number(d.expressFee) || 0,
  };
}

export function getLowStockThreshold() {
  return Number(getSettings().inventory.lowStockThreshold) || 10;
}

// ---------- product catalog helpers (cost / SKU) ----------
// Seed products carry no cost/sku; admin edits persist them in overrides and
// hydration merges them back. Fallbacks keep old data working.
export function getCost(product) {
  if (!product) return 0;
  const c = Number(product.cost);
  if (Number.isFinite(c) && c >= 0) return c;
  return Math.max(0, Math.round((Number(product.price) || 0) * 0.7));
}

export function getSku(product) {
  if (!product) return "—";
  if (product.sku) return String(product.sku);
  return `FC-${String(product.id || "").toUpperCase()}`;
}

export function discountPctOf(original, selling) {
  const o = Number(original);
  const s = Number(selling);
  if (!Number.isFinite(o) || o <= 0 || !Number.isFinite(s) || s < 0) return 0;
  return Math.max(0, Math.round(((o - s) / o) * 100));
}

// ---------- expenses (demo operating costs) ----------
export function getExpenses() {
  const raw = readJSON("freshcart_expenses", []);
  return Array.isArray(raw) ? raw : [];
}

export const EXPENSE_CATEGORIES = ["Packaging", "Delivery", "Marketing", "Rent", "Utilities", "Other"];

export function saveExpense(entry) {
  const list = getExpenses();
  if (entry.id) {
    writeJSON("freshcart_expenses", list.map((e) => (e.id === entry.id ? { ...entry } : entry)));
  } else {
    writeJSON("freshcart_expenses", [{ ...entry, id: `ex-${Date.now()}`, sample: false }, ...list]);
  }
  logActivity("expense", `Demo expense recorded: ${entry.description} (₹${entry.amount})`);
  notify("expenses");
}

export function deleteExpense(id) {
  writeJSON("freshcart_expenses", getExpenses().filter((e) => e.id !== id));
  notify("expenses");
}

export function validateExpense(e) {
  const errs = {};
  if (!String(e.description || "").trim()) errs.description = "Description is required.";
  if (!EXPENSE_CATEGORIES.includes(e.category)) errs.category = "Choose a category.";
  if (!(Number(e.amount) > 0)) errs.amount = "Amount must be greater than zero.";
  if (!e.date || Number.isNaN(Date.parse(e.date))) errs.date = "Valid date is required.";
  return errs;
}

// ---------- sample historical orders (deterministic demo dataset) ----------
// Clearly labelled `sample: true`. Used ONLY for analytics so charts have
// meaningful history; never shown as the customer's real orders.
function sampleRng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SAMPLE_POOL = [
  ["k01", 1], ["k04", 1], ["k07", 2], ["k11", 2], ["k14", 1], ["k22", 2],
  ["k26", 1], ["k29", 1], ["k32", 1], ["k37", 1], ["k41", 1], ["k47", 1],
];

export function getSampleOrders(catalog = []) {
  const byId = {};
  catalog.forEach((p) => { byId[p.id] = p; });
  const rnd = sampleRng(20260117);
  const out = [];
  const emails = ["priya@example.com", "rahul@example.com", "ananya@example.com"];
  const names = ["Priya Sharma", "Rahul Verma", "Ananya Iyer"];
  for (let d = 89; d >= 0; d--) {
    const day = new Date();
    day.setDate(day.getDate() - d);
    const weekend = [0, 6].includes(day.getDay());
    const n = weekend ? 1 + Math.floor(rnd() * 2) : (rnd() < 0.55 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const slots = 1 + Math.floor(rnd() * 3);
      const items = [];
      let subtotal = 0;
      for (let s = 0; s < slots; s++) {
        const [pid, baseQty] = SAMPLE_POOL[Math.floor(rnd() * SAMPLE_POOL.length)];
        const p = byId[pid];
        if (!p) continue;
        const qty = baseQty;
        subtotal += p.price * qty;
        items.push({ id: p.id, name: p.name, image: p.image, price: p.price, cost: getCost(p), qty, unit: p.unit, category: p.category });
      }
      if (!items.length) continue;
      const couponOff = subtotal >= 499 && rnd() < 0.3 ? Math.min(50, Math.round(subtotal * 0.1)) : 0;
      const delivery = subtotal >= 499 ? 0 : 39;
      const who = Math.floor(rnd() * 3);
      const at = new Date(day);
      at.setHours(9 + Math.floor(rnd() * 11), Math.floor(rnd() * 60), 0, 0);
      const rr = Math.floor(rnd() * 1e8).toString().padStart(8, "0");
      out.push({
        ref: `FC${rr}`,
        date: at.toISOString(),
        items,
        totals: { subtotal, mrp: subtotal, discount: 0, couponOff, delivery, total: Math.max(0, subtotal - couponOff + delivery) },
        coupon: couponOff ? "WELCOME50" : null,
        address: { name: names[who], email: emails[who], phone: "98XXXXXX00", city: "Mumbai", pin: "400001" },
        delivery: { id: "standard", name: "Standard Delivery", time: "2–4 hours" },
        payment: "Cash on Delivery",
        status: rnd() < 0.06 ? "Cancelled" : "Delivered",
        sample: true,
      });
    }
  }
  return out;
}

// Real orders + labelled samples for analytics. Real orders always win on
// ref collisions (none expected — refs are timestamp/random based).
export function getAnalyticsOrders(catalog = []) {
  const real = getOrders();
  const samples = getSampleOrders(catalog);
  const refs = new Set(real.map((o) => o.ref));
  return [...real, ...samples.filter((o) => !refs.has(o.ref))];
}

// ---------- activity (demo events) ----------
export function getActivity() {
  const raw = readJSON(K.activity, []);
  return Array.isArray(raw) ? raw : [];
}

export function logActivity(kind, text) {
  const list = getActivity();
  list.unshift({ id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind, text, date: new Date().toISOString() });
  writeJSON(K.activity, list.slice(0, 120));
  notify("activity");
}

export function seedActivityIfEmpty() {
  if (getActivity().length > 0) return;
  writeJSON(K.activity, [
    { id: "a-seed-1", kind: "order", text: "Demo order FC10023981 created (sample)", date: new Date(Date.now() - 36e5).toISOString() },
    { id: "a-seed-2", kind: "inventory", text: "Demo inventory updated: Whole Wheat Atta restocked (sample)", date: new Date(Date.now() - 72e5).toISOString() },
    { id: "a-seed-3", kind: "coupon", text: "Demo coupon FRESH10 reviewed (sample)", date: new Date(Date.now() - 864e5).toISOString() },
    { id: "a-seed-4", kind: "customer", text: "Demo customer Ananya Iyer registered (sample)", date: new Date(Date.now() - 2 * 864e5).toISOString() },
  ]);
}

// ---------- analytics (simulated series, clearly labelled) ----------
// Deterministic PRNG so simulated charts are stable across renders.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getSalesSeries(days = 30) {
  const orders = getOrders();
  const byDay = {};
  orders.forEach((o) => {
    const d = new Date(o.date);
    if (Number.isNaN(d)) return;
    const key = d.toISOString().slice(0, 10);
    byDay[key] = byDay[key] || { revenue: 0, orders: 0 };
    byDay[key].revenue += Number(o.totals?.total) || 0;
    byDay[key].orders += 1;
  });
  const realDays = Object.keys(byDay).length;
  const out = [];
  const today = new Date();
  if (realDays >= 5) {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), ...(byDay[key] || { revenue: 0, orders: 0 }) });
    }
    return { points: out, simulated: false };
  }
  const rnd = mulberry32(days * 97 + 13);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const weekend = [0, 6].includes(d.getDay()) ? 1.35 : 1;
    const revenue = Math.round((4200 + rnd() * 6800) * weekend);
    out.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue,
      orders: Math.max(2, Math.round(revenue / 640)),
    });
  }
  return { points: out, simulated: true };
}

// ---------- CSV ----------
export function toCSV(rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

export function downloadCSV(filename, rows) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- misc ----------
export const formatDateTime = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-IN");
  } catch {
    return "—";
  }
};

export const timeAgo = (iso) => {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
