import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { formatPrice } from "../../data/products";
import { demoStatusOf, getCustomers, getOrders, useDemoVersion } from "../../utils/demoStore";
import {
  EmptyState, Modal, Pager, SearchInput, StatusBadge, TableWrap, tdCls, thCls,
} from "../../components/admin/ui";
import { SectionHead } from "../../components/admin/dark";
import { useGsapScope } from "../../hooks/useGsap";

const PAGE_SIZE = 8;

export default function Customers() {
  const v = useDemoVersion();
  const scope = useGsapScope(() => {});
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("spent");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState(null);

  const list = useMemo(() => getCustomers(), [v]);
  const orders = useMemo(getOrders, [v]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = [...list];
    if (needle) {
      out = out.filter((c) => [c.name, c.email, c.phone].filter(Boolean).join(" ").toLowerCase().includes(needle));
    }
    const by = {
      spent: (a, b) => b.spent - a.spent,
      orders: (a, b) => b.orders - a.orders,
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
      recent: (a, b) => new Date(b.lastOrder || b.joined || 0) - new Date(a.lastOrder || a.joined || 0),
    }[sort] || ((a, b) => b.spent - a.spent);
    return out.sort(by);
  }, [list, q, sort]);

  useEffect(() => { setPage(0); }, [q, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const openCust = openId ? list.find((c) => c.id === openId) : null;
  const openOrders = useMemo(() => {
    if (!openCust) return [];
    return orders
      .filter((o) => {
        const em = String(o.address?.email || o.customerEmail || "").toLowerCase();
        if (openCust.email && openCust.email !== "—") return em === String(openCust.email).toLowerCase();
        return String(o.address?.name || o.customerName || "") === String(openCust.name || "");
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [openCust, orders]);

  return (
    <div ref={scope} className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Directory"
        title="Customers"
        sub="Derived from demo accounts + order history. Passwords/tokens are never stored or shown."
      />
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search name or email…" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort customers" className="w-auto rounded-xl border border-stone-200 bg-[#FAFAF5] px-3.5 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white">
          {[["spent", "Top spenders"], ["orders", "Most orders"], ["name", "Name A–Z"], ["recent", "Most recent"]].map(([val, l]) => <option key={val} value={val}>{l}</option>)}
        </select>
        <span className="ml-auto self-center text-[13px] text-stone-500">{filtered.length} customers (demo)</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No demo customers match" sub="Try a different search." />
      ) : (
        <>
          <TableWrap>
            <thead><tr>
              <th className={thCls}>Customer</th><th className={thCls}>Contact</th><th className={thCls}>Orders</th>
              <th className={thCls}>Spent</th><th className={thCls}>Last order</th><th className={thCls}><span className="sr-only">Open</span></th>
            </tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-green-50/40">
                  <td className={tdCls}>
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-extrabold text-[#14532D]">
                        {String(c.name || "?").trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-bold">{c.name}</span>
                        <span className="block text-[11px] text-stone-400">{c.sample ? "Sample profile" : "Demo account"}</span>
                      </span>
                    </span>
                  </td>
                  <td className={tdCls + " text-[13px]"}><p className="truncate">{c.email}</p><p className="text-xs text-stone-400">{c.phone}</p></td>
                  <td className={tdCls + " font-extrabold"}>{c.orders}</td>
                  <td className={tdCls + " font-extrabold"}>{formatPrice(c.spent)}</td>
                  <td className={tdCls + " whitespace-nowrap text-xs text-stone-500"}>{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString("en-IN") : "—"}</td>
                  <td className={tdCls}>
                    <button onClick={() => setOpenId(c.id)} className="rounded-full bg-[#14532D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#16A34A]">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <Pager page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
        </>
      )}

      <AnimatePresence>
        {openCust && (
          <Modal key="cust" title={openCust.name} onClose={() => setOpenId(null)}>
            <p className="text-sm text-stone-500">{openCust.email} • {openCust.phone}</p>
            <p className="mt-1 text-xs text-stone-400">
              {openCust.orders} demo orders • {formatPrice(openCust.spent)} lifetime demo spend
            </p>
            <h4 className="mt-4 text-sm font-extrabold">Order history (demo)</h4>
            {openOrders.length === 0 ? (
              <p className="mt-2 text-sm text-stone-400">No demo orders for this customer yet.</p>
            ) : (
              <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto">
                {openOrders.map((o) => (
                  <li key={o.ref} className="flex flex-wrap items-center gap-2 rounded-xl bg-[#FAFAF5] px-3 py-2 text-[13px] ring-1 ring-stone-100">
                    <span className="font-mono font-extrabold text-[#14532D]">{o.ref}</span>
                    <span className="text-stone-500">{new Date(o.date).toLocaleDateString("en-IN")}</span>
                    <span className="ml-auto font-extrabold">{formatPrice(o.totals?.total)}</span>
                    <StatusBadge status={demoStatusOf(o)} />
                  </li>
                ))}
              </ul>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
