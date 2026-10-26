import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap, prefersReducedMotion } from "../../hooks/useGsap";

// Dark-navy glass kit for the premium admin shell. Light content panels
// (existing ui.jsx `card`) stay as-is for readability; these frame them.

export const glass =
  "rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md";

export function useCountUp(target, { duration = 1.1, format = (v) => v } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const end = Number(target) || 0;
    if (prefersReducedMotion()) {
      el.textContent = format(end);
      return;
    }
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: end,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = format(obj.v);
      },
    });
    return () => tween.kill();
  }, [target, duration, format]);
  return ref;
}

export function DarkKpi({ icon: Icon, label, value, display, sub, accent = "#5eead4", delta = null }) {
  const numRef = useCountUp(typeof value === "number" ? value : 0, {
    format: (v) => (display != null ? display : Number.isInteger(value) ? String(Math.round(v)) : v.toFixed(1)),
  });
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`${glass} min-w-0 p-4 sm:p-5`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: "rgba(255,255,255,0.08)", color: accent }}
        >
          <Icon size={20} />
        </span>
        {typeof delta === "number" && !Number.isNaN(delta) && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${delta >= 0 ? "bg-emerald-400/15 text-emerald-300" : "bg-red-400/15 text-red-300"}`}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {delta === null && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-slate-300">new</span>
        )}
      </div>
      <p ref={numRef} className="mt-3 truncate text-xl font-extrabold text-white sm:text-2xl" title={String(display ?? value)}>
        {display ?? value}
      </p>
      <p className="text-[13px] font-semibold text-slate-300">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
    </motion.div>
  );
}

export function SectionHead({ eyebrow, title, sub, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-widest text-teal-300">{eyebrow}</p>
        )}
        <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">{title}</h2>
        {sub && <p className="mt-1 text-[13px] text-slate-400">{sub}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

export function DarkEmpty({ title, sub, action }) {
  return (
    <div className={`${glass} p-10 text-center`}>
      <h3 className="font-extrabold text-white">{title}</h3>
      {sub && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">{sub}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
