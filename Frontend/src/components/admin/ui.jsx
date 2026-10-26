import { useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Download, Inbox, Search, X } from "lucide-react";
import { RANGE_PRESETS } from "../../utils/dateRanges";
import { formatDateTime, toCSV, downloadCSV } from "../../utils/demoStore";
import { validateExpense, EXPENSE_CATEGORIES, saveExpense, deleteExpense } from "../../utils/demoStore";

export const card = "rounded-3xl bg-white p-5 ring-1 ring-stone-100";
export const inputCls =
  "w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-3.5 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100";
export const btnPrimary =
  "inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#14532D] disabled:opacity-60";
export const btnGhost =
  "inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-4 py-2 text-[13px] font-bold text-stone-600 hover:bg-stone-50";

export function KpiCard({ icon: Icon, label, value, sub, delta, spark, tone = "green" }) {
  const tones = { green: "bg-green-100 text-[#16A34A]", orange: "bg-orange-100 text-[#f97316]", dark: "bg-[#14532D] text-white", red: "bg-red-100 text-red-600" };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`${card} min-w-0`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon size={20} />
        </span>
        {typeof delta === "number" && !Number.isNaN(delta) && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${delta >= 0 ? "bg-green-100 text-[#14532D]" : "bg-red-100 text-red-600"}`}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {delta === null && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-400">new</span>}
      </div>
      <p className="mt-3 truncate text-xl font-extrabold sm:text-2xl" title={String(value)}>{value}</p>
      <p className="text-[13px] font-semibold text-stone-500">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-stone-400">{sub}</p>}
      {spark}
    </motion.div>
  );
}

export function EmptyState({ title, sub, action }) {
  return (
    <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-stone-100">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
        <Inbox size={28} />
      </span>
      <h3 className="mt-3 font-extrabold">{title}</h3>
      {sub && <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">{sub}</p>}
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = String(status || "");
  const color = /cancel/i.test(s) ? "bg-red-100 text-red-700" : /deliver/i.test(s) || /confirm/i.test(s) ? "bg-green-100 text-[#14532D]" : /ship/i.test(s) ? "bg-blue-100 text-blue-700" : /pend/i.test(s) ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600";
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${color}`}>{s || "—"}</span>;
}

export function TableWrap({ children, minWidth = 720 }) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-stone-100">
      <table className="w-full text-left text-sm" style={{ minWidth }}>{children}</table>
    </div>
  );
}

export const thCls = "whitespace-nowrap px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-stone-400";
export const tdCls = "border-t border-stone-100 px-4 py-3 align-middle";

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={`${inputCls} pl-10`} />
    </div>
  );
}

export function Pager({ page, pages, total, onPage }) {
  if (pages <= 1) return <p className="mt-3 text-xs text-stone-400">{total} record{total === 1 ? "" : "s"}</p>;
  return (
    <div className="mt-3 flex items-center justify-between gap-2 text-sm">
      <p className="text-xs text-stone-400">{total} records • page {page + 1} of {pages}</p>
      <div className="flex gap-1">
        <button onClick={() => onPage(Math.max(0, page - 1))} disabled={page === 0} aria-label="Previous page" className="rounded-lg border border-stone-200 p-2 disabled:opacity-40 hover:bg-stone-50"><ChevronLeft size={16} /></button>
        <button onClick={() => onPage(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1} aria-label="Next page" className="rounded-lg border border-stone-200 p-2 disabled:opacity-40 hover:bg-stone-50"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/50" />
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className={`relative max-h-[92vh] w-full overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 hover:bg-stone-100"><X size={19} /></button>
        </div>
        <div className="mt-4">{children}</div>
      </motion.div>
    </div>
  );
}

export function ConfirmDialog({ title, body, confirmLabel = "Delete", onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-label={title}>
      <div onClick={onCancel} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <p className="mt-1 text-sm text-stone-500">{body}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="rounded-full border border-stone-200 py-2.5 text-sm font-bold hover:bg-stone-50">Cancel</button>
          <button onClick={onConfirm} className="rounded-full bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function DateRangePicker({ preset, onPreset, custom, onCustom }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`${btnGhost} bg-white`} aria-expanded={open}>
        <CalendarDays size={15} /> {RANGE_PRESETS.find((r) => r.id === preset)?.label || "Range"} <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-[min(16rem,calc(100vw-2rem))] rounded-2xl bg-white p-2 shadow-xl ring-1 ring-stone-200">
          {RANGE_PRESETS.map((r) => (
            <button key={r.id} onClick={() => { onPreset(r.id); if (r.id !== "custom") setOpen(false); }} className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${preset === r.id ? "bg-green-100 font-bold text-[#14532D]" : "hover:bg-stone-50"}`}>
              {r.label}
            </button>
          ))}
          {preset === "custom" && (
            <div className="grid grid-cols-1 gap-2 border-t border-stone-100 p-2 min-[420px]:grid-cols-2">
              <input type="date" value={custom.start || ""} onChange={(e) => onCustom({ ...custom, start: e.target.value })} aria-label="Start date" className={inputCls} />
              <input type="date" value={custom.end || ""} onChange={(e) => onCustom({ ...custom, end: e.target.value })} aria-label="End date" className={inputCls} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CsvButton({ filename, rows, label }) {
  if (!rows?.length) return null;
  return (
    <button onClick={() => downloadCSV(filename, rows)} className={btnGhost}>
      <Download size={15} /> {label || "Export CSV"}
    </button>
  );
}

export function csvCell(v) {
  return v;
}

export function toCsvRows(rows) {
  return toCSV(rows);
}

// ---------- demo expense panel (reused on Analytics + Reports) ----------
export function ExpensePanel({ expenses, onChanged, compact }) {
  const [form, setForm] = useState({ description: "", category: "Packaging", amount: "", date: new Date().toISOString().slice(0, 10), notes: "" });
  const [errors, setErrors] = useState({});
  const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const submit = (e) => {
    e.preventDefault();
    const errs = validateExpense({ ...form, amount: Number(form.amount) });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    saveExpense({ description: form.description.trim(), category: form.category, amount: Number(form.amount), date: new Date(form.date).toISOString(), notes: form.notes.trim() });
    setForm({ description: "", category: "Packaging", amount: "", date: new Date().toISOString().slice(0, 10), notes: "" });
    onChanged?.();
  };

  return (
    <div className={card}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-extrabold">Operating expenses <span className="text-xs font-medium text-stone-400">(demo entries)</span></h3>
        <span className="text-sm font-extrabold">₹{total.toLocaleString("en-IN")}</span>
      </div>
      <form onSubmit={submit} className={`mt-3 grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description *" aria-label="Expense description" className={inputCls} />
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} aria-label="Expense category" className={inputCls}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="number" min="0" step="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="₹ Amount *" aria-label="Expense amount" className={inputCls} />
        </div>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Expense date" className={inputCls} />
        <button className={btnPrimary}>Add Expense</button>
      </form>
      {Object.values(errors)[0] && <p className="mt-1 text-xs font-medium text-red-600">{Object.values(errors)[0]}</p>}
      <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto">
        {expenses.length === 0 && <p className="text-[13px] text-stone-400">No demo expenses recorded yet.</p>}
        {expenses.slice(0, 30).map((x) => (
          <div key={x.id} className="flex items-center gap-2 rounded-xl bg-[#FAFAF5] px-3 py-2 text-[13px] ring-1 ring-stone-100">
            <span className="min-w-0 flex-1 truncate font-semibold">{x.description} <span className="font-normal text-stone-400">• {x.category} • {formatDateTime(x.date).slice(0, 10)}</span></span>
            <b>₹{Number(x.amount).toLocaleString("en-IN")}</b>
            <button onClick={() => { deleteExpense(x.id); onChanged?.(); }} aria-label={`Delete ${x.description}`} className="rounded-lg p-1 text-stone-300 hover:bg-red-50 hover:text-red-500"><X size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
