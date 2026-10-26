// Frontend-only demo address book (localStorage). No backend.
const KEY = "freshcart_addresses";

export function getAddresses() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAddresses(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

export function getDefaultAddress() {
  const list = getAddresses();
  return list.find((a) => a.isDefault) || list[0] || null;
}

export const EMPTY_ADDRESS = {
  label: "Home",
  name: "",
  phone: "",
  flat: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pin: "",
  isDefault: false,
};

export function validateAddress(a) {
  const e = {};
  if (!String(a.name || "").trim() || String(a.name).trim().length < 3) e.name = "Enter the recipient's full name.";
  if (!/^[6-9]\d{9}$/.test(String(a.phone || "").replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit mobile number.";
  if (!String(a.flat || "").trim()) e.flat = "Required.";
  if (!String(a.street || "").trim()) e.street = "Required.";
  if (!String(a.city || "").trim()) e.city = "Required.";
  if (!String(a.state || "").trim()) e.state = "Required.";
  if (!/^\d{6}$/.test(String(a.pin || "").trim())) e.pin = "Enter a valid 6-digit PIN code.";
  return e;
}
