import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "../../data/products";
import {
  deleteCategoryById, logActivity, notify, saveCategory, useDemoVersion,
} from "../../utils/demoStore";
import {
  ConfirmDialog, EmptyState, Modal, SearchInput, TableWrap,
  btnPrimary, inputCls, tdCls, thCls,
} from "../../components/admin/ui";
import { SectionHead } from "../../components/admin/dark";
import { useShop } from "../../context/ShopContext";
import { useGsapScope } from "../../hooks/useGsap";

export default function Categories() {
  const v = useDemoVersion();
  const { pushToast } = useShop();
  const scope = useGsapScope(() => {});
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [reassignTo, setReassignTo] = useState("");

  const live = CATEGORIES;
  const counts = useMemo(() => {
    const m = {};
    PRODUCTS.forEach((p) => { m[p.category] = (m[p.category] || 0) + 1; });
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, v]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...live].filter((c) => !needle || [c.name, c.id, c.description].filter(Boolean).join(" ").toLowerCase().includes(needle));
  }, [live, v, q]);

  const openAdd = () => {
    setEditing({ id: "", name: "", description: "", image: "", active: true });
    setErrors({});
  };
  const openEdit = (c) => {
    setEditing({ id: c.id, name: c.name, description: c.description || "", image: c.image || "", active: c.active !== false, seed: !!c.seed });
    setErrors({});
  };

  const onSave = () => {
    const name = String(editing.name || "").trim();
    const e = {};
    if (!name) e.name = "Category name is required.";
    const dup = live.some((c) => c.id !== editing.id && String(c.name || "").trim().toLowerCase() === name.toLowerCase());
    if (name && dup) e.name = "A category with this name already exists (case-insensitive).";
    setErrors(e);
    if (Object.keys(e).length) return;
    const isNew = !editing.id;
    const cat = {
      id: isNew ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `c-${Date.now().toString(36)}` : editing.id,
      name,
      description: String(editing.description || "").trim(),
      image: editing.image || "",
      active: editing.active !== false,
      ...(isNew ? {} : { seed: editing.seed }),
    };
    saveCategory(cat);
    const at = CATEGORIES.findIndex((c) => c.id === cat.id);
    if (at >= 0) CATEGORIES[at] = { ...CATEGORIES[at], ...cat };
    else CATEGORIES.push({ ...cat });
    try { logActivity("category", `${isNew ? "Added" : "Updated"} demo category ${name}`); } catch { /* ignore */ }
    pushToast(isNew ? "Demo category added." : "Demo category updated.", "success");
    setEditing(null);
  };

  const askDelete = (c) => {
    setDeleting(c);
    setReassignTo(CATEGORIES.find((x) => x.id !== c.id)?.id || "");
  };

  const onDelete = () => {
    if (!deleting) return;
    const affected = PRODUCTS.filter((p) => p.category === deleting.id);
    if (affected.length > 0 && !reassignTo) {
      pushToast(`Pick a category to move the ${affected.length} product(s) to — or cancel.`, "error");
      return;
    }
    if (affected.length > 0) {
      // Move products first (persisted as overrides), then delete the category.
      const ov = JSON.parse(localStorage.getItem("freshcart_product_overrides") || "{}");
      affected.forEach((p) => {
        ov[p.id] = { ...(ov[p.id] || {}), category: reassignTo };
        const at = PRODUCTS.findIndex((x) => x.id === p.id);
        if (at >= 0) PRODUCTS[at] = { ...PRODUCTS[at], category: reassignTo };
      });
      try { localStorage.setItem("freshcart_product_overrides", JSON.stringify(ov)); } catch { /* ignore */ }
      notify("products");
    }
    deleteCategoryById(deleting.id, live.map((c) => c.id));
    const at = CATEGORIES.findIndex((c) => c.id === deleting.id);
    if (at >= 0) CATEGORIES.splice(at, 1);
    try { logActivity("category", `Deleted demo category ${deleting.name}`); } catch { /* ignore */ }
    pushToast("Demo category deleted.", "success");
    setDeleting(null);
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
        eyebrow="Catalogue"
        title="Category management"
        sub="Shared with shop filters and the product form. Deleting a used category requires reassignment."
        right={
          <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#14532D]">
            <Plus size={15} /> Add Category
          </button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search categories…" />
        <span className="ml-auto self-center text-[13px] text-stone-500">{filtered.length} categories (demo)</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No demo categories match" sub="Adjust search or add a category." />
      ) : (
        <TableWrap>
          <thead><tr>
            <th className={thCls}>Category</th><th className={thCls}>Products</th><th className={thCls}>Status</th>
            <th className={thCls}><span className="sr-only">Actions</span></th>
          </tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-green-50/40">
                <td className={tdCls}>
                  <span className="flex items-center gap-2.5">
                    {c.image ? <img src={c.image} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-400">—</span>}
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold">{c.name}</span>
                      <span className="block truncate text-[11px] text-stone-400">{c.description || c.id}</span>
                    </span>
                  </span>
                </td>
                <td className={tdCls + " font-extrabold"}>{counts[c.id] || 0}</td>
                <td className={tdCls}>
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${c.active === false ? "bg-stone-200 text-stone-500" : "bg-green-100 text-[#14532D]"}`}>
                    {c.active === false ? "Inactive" : "Active"}
                  </span>
                </td>
                <td className={tdCls}>
                  <span className="flex gap-1.5">
                    <button onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`} className="rounded-lg border border-stone-200 p-2 hover:bg-stone-50"><Pencil size={15} /></button>
                    <button onClick={() => askDelete(c)} aria-label={`Delete ${c.name}`} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <AnimatePresence>
        {editing && (
          <Modal key="cform" title={editing.id ? `Edit — ${editing.name || "category"}` : "Add Category (demo)"} onClose={() => setEditing(null)}>
            <div className="grid gap-3">
              <div>
                <label className={flabel} htmlFor="cf-name">Category name *</label>
                <input id="cf-name" value={editing.name} onChange={setF("name")} className={field} placeholder="e.g. Breakfast Mixes" />{ferr("name")}
              </div>
              <div>
                <label className={flabel} htmlFor="cf-desc">Description</label>
                <input id="cf-desc" value={editing.description} onChange={setF("description")} className={field} />
              </div>
              <div>
                <label className={flabel} htmlFor="cf-img">Image URL (optional)</label>
                <input id="cf-img" value={editing.image} onChange={setF("image")} className={field} placeholder="https://…" />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
                <input type="checkbox" checked={!!editing.active} onChange={setF("active")} className="h-4 w-4 accent-[#16A34A]" /> Active
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing(null)} className="rounded-full border border-stone-200 px-6 py-2.5 text-sm font-bold hover:bg-stone-50">Cancel</button>
              <button onClick={onSave} className="rounded-full bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">Save Category</button>
            </div>
          </Modal>
        )}
        {deleting && (
          <ConfirmDialog
            key="cdel"
            title={`Delete ${deleting.name}?`}
            body={(PRODUCTS.filter((p) => p.category === deleting.id).length > 0)
              ? `It holds ${PRODUCTS.filter((p) => p.category === deleting.id).length} product(s). Choose where to move them — products are never left without a category.`
              : "Empty category. Safe to remove from the demo catalogue."}
            confirmLabel="Delete"
            onCancel={() => setDeleting(null)}
            onConfirm={onDelete}
          />
        )}
      </AnimatePresence>
      {deleting && PRODUCTS.filter((p) => p.category === deleting.id).length > 0 && (
        <div className="fixed bottom-24 left-1/2 z-[96] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-stone-200">
          <label className="mb-1.5 block text-[13px] font-bold" htmlFor="cf-move">Move products to *</label>
          <select id="cf-move" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} className={inputCls}>
            <option value="">— choose —</option>
            {CATEGORIES.filter((c) => c.id !== deleting.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
