// ---------------------------------------------------------------------------
// AI-assistant demo store (frontend-only, localStorage).
// - AI shopping requests are logged locally so the admin demo panel can
//   review them. This is NOT a backend record and is NOT a confirmed order.
// - WhatsApp config lives in demo store settings (adminWhatsApp object).
//   No number is invented or hardcoded: empty means "not configured".
// ---------------------------------------------------------------------------

import { parsePhoneNumberFromString } from "libphonenumber-js";
import { readJSON, writeJSON, getSettings, saveSettings, logActivity, notify } from "./demoStore.js";
import { findCountry } from "../data/countries.js";

const REQ_KEY = "freshcart_ai_requests";

export function getAiRequests() {
  const raw = readJSON(REQ_KEY, []);
  return Array.isArray(raw) ? raw : [];
}

export function saveAiRequest(entry) {
  const list = getAiRequests();
  const rec = {
    id: `AIR-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString(),
    status: "New",
    ...entry,
  };
  writeJSON(REQ_KEY, [rec, ...list].slice(0, 100));
  try {
    logActivity("ai-request", `Demo AI shopping request ${rec.id} logged (${(entry.items || []).length} items)`);
  } catch { /* ignore */ }
  notify("ai-requests");
  return rec;
}

export function updateAiRequestStatus(id, status) {
  const allowed = ["New", "Reviewed", "Quoted", "Closed"];
  if (!allowed.includes(status)) return { ok: false, error: "Unknown status." };
  const list = getAiRequests();
  if (!list.some((r) => r.id === id)) return { ok: false, error: "Request not found." };
  writeJSON(REQ_KEY, list.map((r) => (r.id === id ? { ...r, status } : r)));
  notify("ai-requests");
  return { ok: true };
}

// ---------- admin WhatsApp configuration ----------
// Stored as { countryCode: "IN", dialCode: "+91", phoneNumber: "9876543210" }.
// Empty phoneNumber = not configured (never invent or hardcode a number).
export function getAdminWhatsapp() {
  const s = getSettings();
  const w = (s.store && s.store.adminWhatsapp) || {};
  const country = findCountry(w.countryCode || "IN");
  return {
    countryCode: country.cc,
    dialCode: w.dialCode || country.dial,
    phoneNumber: String(w.phoneNumber || "").replace(/[\s\-().]/g, ""),
  };
}

export function saveAdminWhatsapp({ countryCode, dialCode, phoneNumber }) {
  const s = getSettings();
  const next = {
    ...s,
    store: { ...s.store, adminWhatsapp: { countryCode, dialCode, phoneNumber } },
  };
  saveSettings(next);
  try {
    logActivity("settings", `Demo admin WhatsApp updated (${dialCode} ••••)`);
  } catch { /* ignore */ }
}

// Validate with libphonenumber-js where possible; generic E.164 fallback.
// Returns { ok, digits?, display?, error? }. `digits` has no "+", spaces
// or dashes — the exact international format wa.me requires.
export function validateWhatsappNumber({ countryCode, dialCode, phoneNumber }) {
  const national = String(phoneNumber || "").replace(/[\s\-().]/g, "");
  if (!national) return { ok: false, error: "Enter the WhatsApp number (without country code)." };
  if (!/^\d+$/.test(national)) return { ok: false, error: "Use digits only — no letters or symbols." };
  if (national.length > 15) return { ok: false, error: "Number is too long (max 15 digits)." };
  const full = `${dialCode || ""}${national}`;
  try {
    const parsed = parsePhoneNumberFromString(full, countryCode || undefined);
    if (parsed && parsed.isValid()) {
      return { ok: true, digits: parsed.number.replace("+", ""), display: parsed.formatInternational() };
    }
  } catch { /* fall through to generic checks */ }
  // Generic fallback: plausibly-sized national number (never adds "91").
  if (national.length < 4) return { ok: false, error: "Number looks too short for the selected country." };
  const digits = `${String(dialCode || "").replace(/\D/g, "")}${national}`;
  return { ok: true, digits, display: `${dialCode} ${national}`, fallback: true };
}

export function getConfiguredWhatsapp() {
  const cfg = getAdminWhatsapp();
  if (!cfg.phoneNumber) return { ok: false, error: "missing-config" };
  const v = validateWhatsappNumber(cfg);
  if (!v.ok) return { ok: false, error: "invalid-config", detail: v.error };
  return { ok: true, ...v, cfg };
}

// Official click-to-chat URL. NOTE: wa.me links CANNOT attach a local file —
// the customer must attach the downloaded PDF manually (stated in the UI).
export function buildWhatsappUrl(digits, message) {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
