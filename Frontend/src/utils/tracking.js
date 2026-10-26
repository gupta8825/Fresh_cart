// Frontend delivery-tracking simulation (demo only — NOT real GPS tracking).
// Real rider tracking needs live GPS + backend; here the rider moves along a
// deterministic illustrative line between two labelled demo coordinates.

import { demoStatusOf } from "./demoStore";

// Valid Mumbai coordinates, explicitly labelled demo locations.
export const DEMO_HUB = { lat: 19.1136, lng: 72.8697, label: "FreshCart Hub, Andheri East (demo)" };

const RIDERS = [
  { name: "Aarav M. (demo rider)", vehicle: "Bike • MH-02-DM-4213 (demo)" },
  { name: "Sana K. (demo rider)", vehicle: "E-Bike • MH-02-DM-7781 (demo)" },
  { name: "Rohan P. (demo rider)", vehicle: "Bike • MH-02-DM-3092 (demo)" },
];

function hashRef(ref) {
  let h = 0;
  for (const ch of String(ref)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function riderFor(ref) {
  return RIDERS[hashRef(ref) % RIDERS.length];
}

// Deterministic illustrative destination ~1–3 km from the hub.
// NOT geocoded from the customer's address (stated in the UI).
export function destinationFor(ref) {
  const h = hashRef(`dest:${ref}`);
  const dLat = ((h % 200) / 100 - 1) * 0.022;
  const dLng = (((h >> 8) % 200) / 100 - 1) * 0.022;
  return {
    lat: +(DEMO_HUB.lat + dLat).toFixed(5),
    lng: +(DEMO_HUB.lng + dLng).toFixed(5),
    label: "Demo destination (illustrative — not your address)",
  };
}

// Illustrative route line (NOT a road route): hub → curved midpoint → dest.
export function routeFor(ref) {
  const dest = destinationFor(ref);
  const mid = {
    lat: +((DEMO_HUB.lat + dest.lat) / 2 + 0.006).toFixed(5),
    lng: +((DEMO_HUB.lng + dest.lng) / 2 - 0.008).toFixed(5),
  };
  return [DEMO_HUB, mid, dest];
}

export function pointAlongRoute(route, t) {
  const clamped = Math.min(1, Math.max(0, t));
  // two segments: hub→mid→dest
  if (clamped <= 0.5) {
    const k = clamped * 2;
    return {
      lat: route[0].lat + (route[1].lat - route[0].lat) * k,
      lng: route[0].lng + (route[1].lng - route[0].lng) * k,
    };
  }
  const k = (clamped - 0.5) * 2;
  return {
    lat: route[1].lat + (route[2].lat - route[1].lat) * k,
    lng: route[1].lng + (route[2].lng - route[1].lng) * k,
  };
}

export const TRACK_STAGES = [
  "Order Placed",
  "Order Confirmed",
  "Preparing Your Groceries",
  "Ready for Dispatch",
  "Out for Delivery",
  "Delivered",
];

// Total simulated demo durations (minutes of *demo* time).
export function demoDurationMin(order) {
  const name = String(order?.delivery?.name || order?.delivery?.id || "");
  if (/express/i.test(name)) return 15;
  return 35;
}

// Map the shared admin/order status onto the 6-stage tracking timeline.
export function stageIndexFor(order) {
  const s = demoStatusOf(order);
  if (s === "Cancelled" || s === "Rejected") return -1;
  if (s === "Delivered") return 5;
  if (s === "Out for Delivery" || s === "Shipped") return 4;
  if (s === "Ready for Pickup") return 3;
  if (s === "Accepted" || s === "Processing") return 2;
  return 1; // Pending
}

// --- per-order simulation progress (persisted so refresh resumes) ---
function progressKey(ref) {
  return `freshcart_tracking_${ref}`;
}

export function loadProgress(ref) {
  try {
    const raw = sessionStorage.getItem(progressKey(ref));
    if (!raw) return 0;
    const v = JSON.parse(raw);
    return typeof v?.p === "number" ? Math.min(1, Math.max(0, v.p)) : 0;
  } catch {
    return 0;
  }
}

export function saveProgress(ref, p) {
  try {
    sessionStorage.setItem(progressKey(ref), JSON.stringify({ p, at: Date.now() }));
  } catch { /* ignore */ }
}

// Simulated stage derived from progress (only used while the admin status
// is still in transit: Pending/Processing/Shipped).
export function simStageFor(progress) {
  if (progress >= 1) return 5;
  if (progress >= 0.55) return 4;
  if (progress >= 0.3) return 3;
  return 2;
}

export function etaLabel(order, progress, stage) {
  if (stage === 5 || demoStatusOf(order) === "Delivered") return "Delivered";
  if (stage === -1 || demoStatusOf(order) === "Cancelled" || demoStatusOf(order) === "Rejected")
    return "No delivery — order not fulfilled (demo)";
  const total = demoDurationMin(order);
  const remain = Math.max(1, Math.ceil((1 - progress) * total));
  const lo = Math.max(1, remain - 5);
  return `Estimated arrival: ${lo}–${remain} minutes (simulated)`;
}
