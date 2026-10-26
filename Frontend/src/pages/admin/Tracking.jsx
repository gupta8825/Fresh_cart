import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../data/products";
import { demoStatusOf, getOrders, useDemoVersion } from "../../utils/demoStore";
import { TRACK_STAGES, destinationFor, riderFor, stageIndexFor } from "../../utils/tracking";
import { EmptyState, SearchInput, StatusBadge, TableWrap, tdCls, thCls } from "../../components/admin/ui";
import { SectionHead } from "../../components/admin/dark";
import { useGsapScope } from "../../hooks/useGsap";

const ACTIVE = new Set(["Processing", "Ready for Pickup", "Out for Delivery", "Shipped"]);

export default function Tracking() {
  const v = useDemoVersion();
  const scope = useGsapScope(() => {});
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return getOrders()
      .filter((o) => {
        const s = demoStatusOf(o);
        if (onlyActive && !ACTIVE.has(s)) return false;
        if (!needle) return true;
        const a = o.address || {};
        return [o.ref, a.name, a.city].filter(Boolean).join(" ").toLowerCase().includes(needle);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, q, onlyActive]);

  return (
    <div ref={scope} className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Logistics"
        title="Delivery tracking"
        sub="Simulated demo positions on illustrative routes — not live GPS, no courier connected."
      />
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search ref, customer, city…" />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} className="h-4 w-4 accent-[#16A34A]" />
          Active trips only
        </label>
        <span className="ml-auto self-center text-[13px] text-stone-500">{rows.length} trips (demo)</span>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No demo trips"
          sub="Orders in transit appear here with their simulated rider and route stage."
          action={<Link to="/admin/orders" className="mt-4 inline-block rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">Open orders →</Link>}
        />
      ) : (
        <TableWrap>
          <thead><tr>
            <th className={thCls}>Order</th><th className={thCls}>Rider (demo)</th><th className={thCls}>Route stage</th>
            <th className={thCls}>Destination</th><th className={thCls}>Total</th><th className={thCls}>Status</th><th className={thCls}><span className="sr-only">Open</span></th>
          </tr></thead>
          <tbody>
            {rows.map((o) => {
              const rider = riderFor(o.ref);
              const dest = destinationFor(o.ref);
              const stage = TRACK_STAGES[stageIndexFor(o)] || demoStatusOf(o);
              return (
                <tr key={o.ref} className="hover:bg-green-50/40">
                  <td className={tdCls + " font-mono text-[13px] font-extrabold text-[#14532D]"}>{o.ref}</td>
                  <td className={tdCls + " text-[13px]"}><p className="font-bold">{rider.name}</p><p className="text-[11px] text-stone-400">{rider.vehicle}</p></td>
                  <td className={tdCls + " text-[13px]"}>{stage} <span className="text-stone-400">(simulated)</span></td>
                  <td className={tdCls + " max-w-44 truncate text-[13px] text-stone-500"} title={dest.label}>{o.address?.city || dest.label}</td>
                  <td className={tdCls + " font-extrabold"}>{formatPrice(o.totals?.total)}</td>
                  <td className={tdCls}><StatusBadge status={demoStatusOf(o)} /></td>
                  <td className={tdCls}>
                    <span className="flex gap-1.5">
                      <Link to={`/admin/orders?ref=${o.ref}`} className="rounded-full bg-[#14532D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#16A34A]">Manage</Link>
                      <Link to={`/track-order/${o.ref}`} className="rounded-full border border-green-200 px-3.5 py-1.5 text-xs font-bold text-[#14532D] hover:bg-green-50">Live view</Link>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
