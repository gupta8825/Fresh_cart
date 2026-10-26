// Shared analytics date ranges (IST-aware day boundaries, inclusive end).
// One definition so every dashboard section computes identical periods.

const IST_OFFSET_MIN = 330; // Asia/Kolkata

function istDayStart(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export const RANGE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "month", label: "This month" },
  { id: "prev-month", label: "Previous month" },
  { id: "year", label: "This year" },
  { id: "custom", label: "Custom range" },
];

export function resolveRange(id, custom = {}) {
  const now = new Date();
  const todayS = istDayStart(now);
  const todayE = endOfDay(now);
  switch (id) {
    case "today":
      return { start: todayS, end: todayE, label: "Today" };
    case "yesterday": {
      const y = new Date(todayS);
      y.setDate(y.getDate() - 1);
      return { start: y, end: endOfDay(y), label: "Yesterday" };
    }
    case "7d": {
      const s = new Date(todayS);
      s.setDate(s.getDate() - 6);
      return { start: s, end: todayE, label: "Last 7 days" };
    }
    case "30d": {
      const s = new Date(todayS);
      s.setDate(s.getDate() - 29);
      return { start: s, end: todayE, label: "Last 30 days" };
    }
    case "month": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: s, end: todayE, label: "This month" };
    }
    case "prev-month": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start: s, end: e, label: "Previous month" };
    }
    case "year": {
      const s = new Date(now.getFullYear(), 0, 1);
      return { start: s, end: todayE, label: "This year" };
    }
    case "custom": {
      const s = custom.start ? new Date(`${custom.start}T00:00:00`) : todayS;
      const e = custom.end ? new Date(`${custom.end}T23:59:59`) : todayE;
      const [a, b] = s <= e ? [s, e] : [e, s];
      return { start: a, end: b, label: "Custom range" };
    }
    default:
      return resolveRange("30d");
  }
}

// Previous period of identical length, immediately before `range`.
export function previousRange(range) {
  const len = range.end - range.start;
  return { start: new Date(range.start.getTime() - len - 1), end: new Date(range.start.getTime() - 1) };
}

export function granularityFor(range) {
  const days = (range.end - range.start) / 864e5;
  if (days > 120) return "month";
  if (days > 31) return "week";
  return "day";
}

export function inRange(iso, range) {
  const d = new Date(iso);
  return !Number.isNaN(d) && d >= range.start && d <= range.end;
}

export const TIMEZONE_NOTE = `Day boundaries use store-local time (IST, UTC+${IST_OFFSET_MIN / 60}). Ranges are inclusive.`;
