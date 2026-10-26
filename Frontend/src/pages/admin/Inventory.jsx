import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { PRODUCTS, formatPrice } from "../../data/products";
import {
  adjustStock, getLowStockThreshold, logActivity, readJSON, resolveActive,
  resolveStock, setProductAvailability, useDemoVersion,
} from "../../utils/demoStore";
import {
  EmptyState, Pager, SearchInput, StatusBadge, TableWrap, card, inputCls, tdCls, thCls,
} from "../../components/admin/ui";
import { SectionHead } from "../../components/admin/dark";
import { useShop } from "../../context/ShopContext";
import { useGsapScope } from "../../hooks/useGsap";

const PAGE_SIZE = 9;

export default function Inventory() {
  const v = useDemoVersion();
  const { pushToast } = useShop();
  const scope = useGsapScope(() => {});
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [filter, setFilter] = useState(params.get("stock") || "All");
  const [sort, setSort] = useState("stock-asc");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null); // {id, stock, reason, active}
  const [delta, setDelta] = useState({}); // id -> pending delta

  const live = PRODUCTS;
  const threshold = getLowStockThreshold();
  const cats = useMemo(() => ["All", ...new Set(live.map((p) => p.category))], [live, v]);

  const rows0 = useMemo(() => live.map((p) => ({
    ...p,
    liveStock: resolveStock(p),
    liveActive: resolveActive(p),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [live, v]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = [...rows0];
    if (needle) out = out.filter((p) => [p.name, p.id, p.category].join(" ").toLowerCase().includes(needle));
    if (cat !== "All") out = out.filter((p) => p.category === cat);
    if (filter === "In stock") out = out.filter((p) => p.liveActive && p.liveStock > threshold);
    if (filter === "Low stock") out = out.filter((p) => p.liveActive && p.liveStock > 0 && p.liveStock <= threshold);
    if (filter === "Out of stock") out = out.filter((p) => p.liveActive && p.liveStock <= 0);
    if (filter === "Inactive") out = out.filter((p) => !p.liveActive);
    const by = {
      "stock-asc": (a, b) => a.liveStock - b.liveStock,
      "stock-desc": (a, b) => b.liveStock - a.liveStock,
      name: (a, b) => a.name.localeCompare(b.name),
    }[sort] || ((a, b) => a.liveStock - b.liveStock);
    return out.sort(by);
  }, [rows0, q, cat, filter, sort, threshold]);

  useEffect(() => { setPage(0); }, [q, cat, filter, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const counts = useMemo(() => ({
    low: rows0.filter((p) => p.liveActive && p.liveStock > 0 && p.liveStock <= threshold).length,
    out: rows0.filter((p) => p.liveActive && p.liveStock <= 0).length,
  }), [rows0, threshold]);

  const ledger = useMemo(() => readJSON("freshcart_stock_ledger", []).slice(0, 8), [v]);

  const applyDelta = (id) => {
    const d = Number(delta[id] || 0);
    if (!d) return;
    const next = adjustStock(id, Math.trunc(d), "Admin adjustment (demo)");
    const at = PRODUCTS.findIndex((p) => p.id === id);
    if (at >= 0) PRODUCTS[at] = { ...PRODUCTS[at], stock: next };
    try { logActivity("inventory", `Stock ${d > 0 ? "+" : ""}${d} for ${id} (demo)`); } catch { /* ignore */ }
    pushToast(`Stock updated to ${next} (demo).`, "success");
    setDelta((s) => ({ ...s, [id]: 0 }));
  };

  const openEdit = (p) => setEditing({ id: p.id, name: p.name, stock: p.liveStock, reason: "", active: p.liveActive });

  const saveEdit = () => {
    if (!editing) return;
    const stock = Math.max(0, Math.floor(Number(editing.stock) || 0));
    setProductAvailability(editing.id, { stock, active: editing.active });
    const at = PRODUCTS.findIndex((p) => p.id === editing.id);
    if (at >= 0) PRODUCTS[at] = { ...PRODUCTS[at], stock, active: editing.active };
    pushToast("Inventory updated — storefront reflects it instantly (demo).", "success");
    setEditing(null);
  };

  const statusOf = (p) =>
    !p.liveActive ? "Inactive" : p.liveStock <= 0 ? "Out of stock" : p.liveStock <= threshold ? "Low stock" : "In stock";

  return (
    <div ref={scope} className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Stock"
        title="Inventory management"
        sub={`Low-stock threshold: ${threshold} units (demo). Zero-stock items stay visible but cannot be purchased.`}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[
          ["Low-stock products", counts.low, "bg-amber-400/15 text-amber-200"],
          ["Out-of-stock products", counts.out, "bg-red-400/15 text-red-300"],
        ].map(([label, value, cls]) => (
          <div key={label} className={`${card} !bg-white/[0.06] !ring-white/10`}>
            <p className="truncate text-xl font-extrabold text-white sm:text-2xl">{value}</p>
            <p className="text-[13px] font-semibold text-slate-300">{label}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>demo</span>
          </div>
        ))}
        <div className={`${card} col-span-2 !bg-white/[0.06] !ring-white/10`}>
          <p className="text-[13px] font-semibold text-slate-300">Recent stock changes (demo ledger)</p>
          {ledger.length === 0 ? (
            <p className="mt-1 text-xs text-slate-500">No adjustments recorded yet.</p>
          ) : (
            <ul className="mt-1 max-h-20 space-y-1 overflow-y-auto text-xs text-slate-400">
              {ledger.map((l, i) => (
                <li key={i} className="truncate">{l.id} • {l.delta > 0 ? `+${l.delta}` : l.delta} • {l.reason} • {new Date(l.date).toLocaleString("en-IN")}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search name, ID, category…" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category filter" className={`${inputCls} w-auto`}>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Stock filter" className={`${inputCls} w-auto`}>
          {["All", "In stock", "Low stock", "Out of stock", "Inactive"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort inventory" className={`${inputCls} w-auto`}>
          {[["stock-asc", "Lowest stock"], ["stock-desc", "Highest stock"], ["name", "Name A–Z"]].map(([val, l]) => <option key={val} value={val}>{l}</option>)}
        </select>
        <span className="ml-auto self-center text-[13px] text-stone-500">{filtered.length} SKUs (demo)</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No demo SKUs match" sub="Adjust search or filters." />
      ) : (
        <>
          <TableWrap>
            <thead><tr>
              <th className={thCls}>Product</th><th className={thCls}>Stock</th><th className={thCls}>Status</th>
              <th className={thCls}>Adjust</th><th className={thCls}><span className="sr-only">Edit</span></th>
            </tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-green-50/40">
                  <td className={tdCls}>
                    <span className="flex items-center gap-2.5">
                      {p.image ? <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-400">—</span>}
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-bold">{p.name}</span>
                        <span className="block text-[11px] text-stone-400">{p.category} • {p.unit}</span>
                      </span>
                    </span>
                  </td>
                  <td className={tdCls + " font-extrabold"}>{p.liveStock}</td>
                  <td className={tdCls}><StatusBadge status={statusOf(p)} /></td>
                  <td className={tdCls}>
                    <span className="flex items-center gap-1">
                      <button onClick={() => setDelta((s) => ({ ...s, [p.id]: (Number(s[p.id]) || 0) - 1 }))} aria-label={`Decrease ${p.name}`} className="rounded-lg border border-stone-200 p-1.5 hover:bg-stone-50"><Minus size={14} /></button>
                      <span className="w-10 text-center text-sm font-extrabold">{Number(delta[p.id]) || 0}</span>
                      <button onClick={() => setDelta((s) => ({ ...s, [p.id]: (Number(s[p.id]) || 0) + 1 }))} aria-label={`Increase ${p.name}`} className="rounded-lg border border-stone-200 p-1.5 hover:bg-stone-50"><Plus size={14} /></button>
                      <button onClick={() => applyDelta(p.id)} disabled={!Number(delta[p.id])} className="rounded-full bg-[#14532D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#16A34A] disabled:opacity-40">Apply</button>
                    </span>
                  </td>
                  <td className={tdCls}>
                    <button onClick={() => openEdit(p)} className="rounded-full border border-stone-200 px-3.5 py-1.5 text-xs font-bold hover:bg-stone-50">Set stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <Pager page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={`Set stock for ${editing.name}`}>
          <div onClick={() => setEditing(null)} className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="font-extrabold">Set stock — {editing.name}</h3>
            <label className="mb-1.5 mt-4 block text-[13px] font-bold" htmlFor="inv-stock">Quantity (never negative)</label>
            <input id="inv-stock" type="number" min="0" step="1" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} className={inputCls} />
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="h-4 w-4 accent-[#16A34A]" />
              Available for purchase (inactive items stay visible but blocked)
            </label>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing(null)} className="rounded-full border border-stone-200 px-6 py-2.5 text-sm font-bold hover:bg-stone-50">Cancel</button>
              <button onClick={saveEdit} className="rounded-full bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
