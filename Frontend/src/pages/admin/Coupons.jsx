import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import {
  deleteCouponByCode, loadCouponMap, saveCoupon, useDemoVersion, validateCouponShape,
} from "../../utils/demoStore";
import {
  ConfirmDialog, EmptyState, Modal, SearchInput, TableWrap,
  btnPrimary, inputCls, tdCls, thCls,
} from "../../components/admin/ui";
import { SectionHead } from "../../components/admin/dark";
import { useShop } from "../../context/ShopContext";
import { useGsapScope } from "../../hooks/useGsap";

const blankForm = () => ({
  code: "", type: "pct", value: "", minOrder: "0", maxOff: "", expiry: "",
  usageLimit: "", used: 0, active: true, label: "",
});

export default function Coupons() {
  const v = useDemoVersion();
  const { pushToast } = useShop();
  const scope = useGsapScope(() => {});
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [origCode, setOrigCode] = useState(null);

  const map = useMemo(loadCouponMap, [v]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return Object.values(map)
      .filter((c) => !needle || [c.code, c.label].filter(Boolean).join(" ").toLowerCase().includes(needle))
      .sort((a, b) => String(a.code).localeCompare(String(b.code)));
  }, [map, q]);

  const openAdd = () => { setEditing(blankForm()); setOrigCode(null); setErrors({}); };
  const openEdit = (c) => {
    setEditing({
      code: c.code, type: c.type, value: String(c.value ?? ""), minOrder: String(c.minOrder ?? 0),
      maxOff: c.maxOff ?? "", expiry: c.expiry ? String(c.expiry).slice(0, 10) : "",
      usageLimit: c.usageLimit ?? "", used: Number(c.used) || 0, active: c.active !== false, label: c.label || "",
    });
    setOrigCode(c.code);
    setErrors({});
  };

  const onSave = () => {
    const code = String(editing.code || "").trim().toUpperCase();
    const others = Object.keys(map).filter((k) => k !== origCode);
    const errs = validateCouponShape({ ...editing, code }, others);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const coupon = {
      code,
      type: editing.type,
      value: Number(editing.value),
      minOrder: Math.max(0, Number(editing.minOrder) || 0),
      ...(editing.type === "pct" && editing.maxOff !== "" ? { maxOff: Number(editing.maxOff) } : {}),
      expiry: editing.expiry || "",
      usageLimit: editing.usageLimit === "" ? "" : Number(editing.usageLimit),
      used: Math.max(0, Number(editing.used) || 0),
      active: editing.active !== false,
      label: editing.label.trim() || `${code} demo coupon`,
    };
    if (origCode && origCode !== code) deleteCouponByCode(origCode);
    saveCoupon(coupon);
    pushToast("Demo coupon saved — checkout uses it immediately.", "success");
    setEditing(null);
  };

  const toggleActive = (c) => {
    saveCoupon({ ...c, active: !(c.active !== false) });
    pushToast(`Coupon ${c.code} ${c.active !== false ? "deactivated" : "activated"} (demo).`, "success");
  };

  const setF = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEditing((f) => (f ? { ...f, [k]: val } : f));
  };
  const ferr = (k) => errors[k] && <p className="mt-1 text-xs font-medium text-red-600">{errors[k]}</p>;
  const field = "w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-3.5 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100";
  const flabel = "mb-1.5 block text-[13px] font-bold";

  return (
    <div ref={scope} className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Promotions"
        title="Coupons & discounts"
        sub="Shared with checkout pricing — changes apply to the demo checkout instantly."
        right={
          <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#14532D]">
            <Plus size={15} /> Add Coupon
          </button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search code or label…" />
        <span className="ml-auto self-center text-[13px] text-stone-500">{list.length} coupons (demo)</span>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No demo coupons match" sub="Adjust search or add one. Checkout falls back to no coupon." />
      ) : (
        <TableWrap>
          <thead><tr>
            <th className={thCls}>Code</th><th className={thCls}>Type / value</th><th className={thCls}>Rules</th>
            <th className={thCls}>Usage</th><th className={thCls}>Status</th><th className={thCls}><span className="sr-only">Actions</span></th>
          </tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.code} className="hover:bg-green-50/40">
                <td className={tdCls}><span className="font-mono font-extrabold text-[#14532D]">{c.code}</span><p className="text-[11px] text-stone-400">{c.label}</p></td>
                <td className={tdCls + " text-[13px] font-bold"}>{c.type === "pct" ? `${c.value}%` : `₹${c.value}`}{c.type === "pct" && c.maxOff ? <span className="font-normal text-stone-400"> cap ₹{c.maxOff}</span> : null}</td>
                <td className={tdCls + " text-[13px] text-stone-500"}>min ₹{c.minOrder || 0}{c.expiry ? ` • till ${String(c.expiry).slice(0, 10)}` : ""}</td>
                <td className={tdCls + " text-[13px]"}>{c.used || 0}{c.usageLimit !== "" && c.usageLimit != null ? ` / ${c.usageLimit}` : ""}</td>
                <td className={tdCls}>
                  <button onClick={() => toggleActive(c)} aria-pressed={c.active !== false} title="Toggle active (demo)"
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${c.active !== false ? "bg-green-100 text-[#14532D]" : "bg-stone-200 text-stone-500"}`}>
                    {c.active !== false ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className={tdCls}>
                  <span className="flex gap-1.5">
                    <button onClick={() => openEdit(c)} className="rounded-full border border-stone-200 px-3.5 py-1.5 text-xs font-bold hover:bg-stone-50">Edit</button>
                    <button onClick={() => setDeleting(c)} className="rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50">Delete</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <AnimatePresence>
        {editing && (
          <Modal key="cform" title={origCode ? `Edit — ${origCode}` : "Add Coupon (demo)"} onClose={() => setEditing(null)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={flabel} htmlFor="cp-code">Code * (A–Z, 0–9)</label>
                <input id="cp-code" value={editing.code} onChange={setF("code")} className={`${field} font-mono uppercase`} placeholder="FRESH20" />{ferr("code")}
              </div>
              <div>
                <label className={flabel} htmlFor="cp-type">Discount type *</label>
                <select id="cp-type" value={editing.type} onChange={setF("type")} className={field}>
                  <option value="pct">Percentage %</option>
                  <option value="flat">Fixed ₹ amount</option>
                </select>
              </div>
              <div>
                <label className={flabel} htmlFor="cp-val">Value * {editing.type === "pct" ? "(≤ 100%)" : "(₹)"}</label>
                <input id="cp-val" type="number" min="0" value={editing.value} onChange={setF("value")} className={field} />{ferr("value")}
              </div>
              <div>
                <label className={flabel} htmlFor="cp-min">Minimum order (₹)</label>
                <input id="cp-min" type="number" min="0" value={editing.minOrder} onChange={setF("minOrder")} className={field} />{ferr("minOrder")}
              </div>
              {editing.type === "pct" && (
                <div>
                  <label className={flabel} htmlFor="cp-cap">Max discount cap (₹, optional)</label>
                  <input id="cp-cap" type="number" min="0" value={editing.maxOff} onChange={setF("maxOff")} className={field} />
                </div>
              )}
              <div>
                <label className={flabel} htmlFor="cp-exp">Expiry (optional)</label>
                <input id="cp-exp" type="date" value={editing.expiry} onChange={setF("expiry")} className={field} />{ferr("expiry")}
              </div>
              <div>
                <label className={flabel} htmlFor="cp-lim">Usage limit (optional)</label>
                <input id="cp-lim" type="number" min="0" step="1" value={editing.usageLimit} onChange={setF("usageLimit")} className={field} />{ferr("usageLimit")}
              </div>
              <div>
                <label className={flabel} htmlFor="cp-used">Times used</label>
                <input id="cp-used" type="number" min="0" step="1" value={editing.used} onChange={setF("used")} className={field} />
              </div>
              <div className="sm:col-span-2">
                <label className={flabel} htmlFor="cp-label">Label</label>
                <input id="cp-label" value={editing.label} onChange={setF("label")} className={field} placeholder="Shown at checkout" />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600 sm:col-span-2">
                <input type="checkbox" checked={!!editing.active} onChange={setF("active")} className="h-4 w-4 accent-[#16A34A]" /> Active (inactive coupons are rejected at checkout)
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing(null)} className="rounded-full border border-stone-200 px-6 py-2.5 text-sm font-bold hover:bg-stone-50">Cancel</button>
              <button onClick={onSave} className="rounded-full bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">Save Coupon</button>
            </div>
          </Modal>
        )}
        {deleting && (
          <ConfirmDialog
            key="cdel"
            title={`Delete ${deleting.code}?`}
            body="Carts holding this demo coupon will simply stop receiving its discount."
            confirmLabel="Delete"
            onCancel={() => setDeleting(null)}
            onConfirm={() => { deleteCouponByCode(deleting.code); pushToast("Demo coupon deleted.", "success"); setDeleting(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
