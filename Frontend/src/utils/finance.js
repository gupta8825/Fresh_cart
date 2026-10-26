// ---------------------------------------------------------------------------
// FreshCart financial calculations — single home for every money formula.
// Accounting convention (documented, demo):
// - ELIGIBLE orders: every status EXCEPT Cancelled. Pending orders are
//   included but flagged `hasPending` so dashboards can disclose them.
// - Gross sales  = Σ (line selling price × qty), before order-level discounts.
// - Discounts    = Σ (mrp−subtotal implicit discount + couponOff), from the
//   recorded order snapshot (never recomputed from live catalogue prices).
// - Net sales    = gross − discounts − refunds. Refunds are NOT supported by
//   the demo order model, so refunds = 0 and profit metrics are labelled
//   "estimated". Delivery fees are NOT revenue (pass-through) and are excluded
//   from gross/net (shown separately).
// - COGS         = Σ (line cost snapshot × qty). Falls back to 70% of selling
//   price when an old order has no cost snapshot (flagged `usedCostFallback`).
// - Gross profit = net − COGS.  Net profit (est.) = gross profit − expenses.
// - Margin       = net profit ÷ net × 100 (0 when net ≤ 0).
// Historical orders keep their own price/cost snapshots — editing a product
// never rewrites history.
// ---------------------------------------------------------------------------

export const isCancelled = (o) => /cancel/i.test(String(o?.status || ""));
export const eligibleOrders = (orders = []) => orders.filter((o) => !isCancelled(o));

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function lineCost(it) {
  const c = Number(it?.cost);
  if (Number.isFinite(c) && c >= 0) return { cost: c, fallback: false };
  const f = Math.max(0, Math.round(num(it?.price) * 0.7));
  return { cost: f, fallback: true };
}

// Per-order breakdown from its own snapshot.
export function orderFinance(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  let gross = 0;
  let cogs = 0;
  let units = 0;
  let fallback = false;
  items.forEach((it) => {
    const qty = Math.max(0, Math.floor(num(it?.qty)));
    gross += num(it?.price) * qty;
    const lc = lineCost(it);
    cogs += lc.cost * qty;
    units += qty;
    if (lc.fallback) fallback = true;
  });
  const t = order?.totals || {};
  // Prefer recorded snapshot values; derive only when missing.
  const couponOff = Math.max(0, num(t.couponOff));
  const implicit = Math.max(0, num(t.discount) || Math.max(0, num(t.mrp) - num(t.subtotal)));
  const discounts = Math.min(gross, implicit + couponOff);
  const refunds = 0; // demo order model has no refunds
  const net = Math.max(0, gross - discounts - refunds);
  const deliveryFee = Math.max(0, num(t.delivery));
  const grossProfit = net - cogs;
  return { gross, discounts, couponOff, implicit, refunds, net, deliveryFee, cogs, units, grossProfit, usedCostFallback: fallback };
}

export function summarizeOrders(orders = [], expenses = []) {
  const eligible = eligibleOrders(orders);
  const agg = { gross: 0, discounts: 0, refunds: 0, net: 0, cogs: 0, units: 0, deliveryFees: 0, orders: eligible.length, usedCostFallback: false, hasPending: false };
  eligible.forEach((o) => {
    const f = orderFinance(o);
    agg.gross += f.gross;
    agg.discounts += f.discounts;
    agg.refunds += f.refunds;
    agg.net += f.net;
    agg.cogs += f.cogs;
    agg.units += f.units;
    agg.deliveryFees += f.deliveryFee;
    if (f.usedCostFallback) agg.usedCostFallback = true;
    if (/pend/i.test(String(o?.status || ""))) agg.hasPending = true;
  });
  const expenseTotal = expenses.reduce((s, e) => s + Math.max(0, num(e?.amount)), 0);
  agg.grossProfit = agg.net - agg.cogs;
  agg.expenses = expenseTotal;
  agg.netProfit = agg.grossProfit - expenseTotal;
  agg.margin = agg.net > 0 ? (agg.netProfit / agg.net) * 100 : 0;
  agg.aov = agg.orders > 0 ? agg.net / agg.orders : 0;
  agg.cancelled = orders.length - eligible.length;
  return agg;
}

// Bucket eligible orders into labelled periods for charts.
export function bucketize(orders = [], { start, end, granularity = "day" }) {
  const s = new Date(start);
  const e = new Date(end);
  const buckets = new Map();
  const keyOf = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    if (granularity === "month") return `${y}-${m}`;
    if (granularity === "week") {
      const monday = new Date(d);
      const dow = (d.getDay() + 6) % 7;
      monday.setDate(d.getDate() - dow);
      return monday.toISOString().slice(0, 10);
    }
    return `${y}-${m}-${String(d.getDate()).padStart(2, "0")}`;
  };
  // Pre-fill every bucket in range (stable empty states).
  const cursor = new Date(s);
  while (cursor <= e) {
    buckets.set(keyOf(cursor), { key: keyOf(cursor), gross: 0, net: 0, cogs: 0, profit: 0, orders: 0, units: 0 });
    if (granularity === "month") cursor.setMonth(cursor.getMonth() + 1);
    else if (granularity === "week") cursor.setDate(cursor.getDate() + 7);
    else cursor.setDate(cursor.getDate() + 1);
  }
  eligibleOrders(orders).forEach((o) => {
    const d = new Date(o.date);
    if (Number.isNaN(d) || d < s || d > e) return;
    const b = buckets.get(keyOf(d));
    if (!b) return;
    const f = orderFinance(o);
    b.gross += f.gross;
    b.net += f.net;
    b.cogs += f.cogs;
    b.profit += f.grossProfit;
    b.orders += 1;
    b.units += f.units;
  });
  return [...buckets.values()];
}

export function rankProducts(orders = [], limit = 8) {
  const map = new Map();
  eligibleOrders(orders).forEach((o) => {
    (o.items || []).forEach((it) => {
      const qty = Math.max(0, Math.floor(num(it?.qty)));
      if (!qty) return;
      const cur = map.get(it.id) || { id: it.id, name: it.name, image: it.image, category: it.category, units: 0, revenue: 0, profit: 0 };
      const lc = lineCost(it);
      cur.units += qty;
      cur.revenue += num(it.price) * qty;
      cur.profit += (num(it.price) - lc.cost) * qty;
      map.set(it.id, cur);
    });
  });
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function rankCategories(orders = [], limit = 10) {
  const map = new Map();
  eligibleOrders(orders).forEach((o) => {
    (o.items || []).forEach((it) => {
      const qty = Math.max(0, Math.floor(num(it?.qty)));
      if (!qty) return;
      const key = it.category || "other";
      const cur = map.get(key) || { category: key, units: 0, revenue: 0 };
      cur.units += qty;
      cur.revenue += num(it.price) * qty;
      map.set(key, cur);
    });
  });
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function statusDistribution(orders = []) {
  const map = {};
  orders.forEach((o) => {
    const s = String(o?.status || "Processing");
    const key = /cancel/i.test(s) ? "Cancelled" : /deliver/i.test(s) ? "Delivered" : /ship/i.test(s) ? "Shipped" : /pend/i.test(s) ? "Pending" : /confirm/i.test(s) ? "Processing" : s;
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}

// % change vs previous period (null when previous is 0 and current isn't).
export function pctChange(cur, prev) {
  if (!prev) return cur ? null : 0;
  return ((cur - prev) / Math.abs(prev)) * 100;
}
