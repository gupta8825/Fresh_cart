import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COUNTRIES } from "../data/countries.js";
import { useLanguage } from "../context/LanguageContext.jsx";

// Searchable country-code dropdown: flag + name + dial code.
// Duplicate dial codes (US/CA +1, RU/KZ +7) all appear — search matches
// every country because filtering is by name AND code, never deduped.
export default function CountryCodeSelector({ value = "IN", onChange, id = "country-code" }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef(null);
  const selected = COUNTRIES.find((c) => c.cc === value) || COUNTRIES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/^\+/, "");
    if (!needle) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.dial.replace("+", "").startsWith(needle) ||
        c.cc.toLowerCase() === needle
    );
  }, [q]);

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-[#FAFAF5] px-3.5 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100"
      >
        <span className="text-lg leading-none" aria-hidden="true">{selected.flag}</span>
        <span className="min-w-0 flex-1 truncate text-left font-semibold">{selected.name} ({selected.dial})</span>
        <ChevronDown size={16} className={`shrink-0 text-stone-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-stone-200 sm:right-auto sm:w-80">
          <div className="relative border-b border-stone-100 p-2">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("assistant.waSearchPlaceholder")}
              aria-label={t("assistant.waSearchPlaceholder")}
              className="w-full rounded-xl bg-[#FAFAF5] py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
          <ul role="listbox" aria-labelledby={id} className="max-h-64 overflow-y-auto p-1.5">
            {matches.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-stone-400">—</li>
            )}
            {matches.map((c) => (
              <li key={`${c.cc}-${c.dial}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.cc === value}
                  onClick={() => { onChange(c); setOpen(false); setQ(""); }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-green-50 ${c.cc === value ? "bg-green-50 font-bold text-[#14532D]" : "text-stone-600"}`}
                >
                  <span className="text-lg leading-none" aria-hidden="true">{c.flag}</span>
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 font-mono text-[13px] text-stone-400">{c.dial}</span>
                  {c.cc === value && <Check size={15} className="shrink-0 text-[#16A34A]" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
