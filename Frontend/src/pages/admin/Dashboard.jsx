import { Link } from "react-router-dom";
import {
  BadgeIndianRupee, Bike, CircleCheck, ClipboardList, Clock3, PackageX, Truck, Wallet,
} from "lucide-react";
import { formatPrice } from "../../data/products";
import { demoStatusOf, getOrders, isNewOrder, useDemoVersion } from "../../utils/demoStore";
import { KpiCard, StatusBadge, card } from "../../components/admin/ui";

function isToday(iso) {
  try {
    const d = new Date(iso);
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  } catch {
    return false;
  }
}

export default function Dashboard() {
  useDemoVersion(); // live update when orders change
  const orders = getOrders();

  const byStatus = (s) => orders.filter((o) => demoStatusOf(o) === s);
  const today = orders.filter((o) => isToday(o.date) && !/cancel|reject/i.test(demoStatusOf(o)));
  const todayRevenue = today.reduce((sum, o) => sum + (Number(o.totals?.total) || 0), 0);
  const recent = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const newOnes = orders.filter(isNewOrder);

  const cards = [
    { icon: ClipboardList, label: "New Orders", value: byStatus("Pending").length, sub: "Awaiting acceptance (demo)", tone: "orange" },
    { icon: Clock3, label: "Pending Acceptance", value: byStatus("Pending").length + byStatus("Accepted").length, sub: "Pending + accepted (demo)", tone: "orange" },
    { icon: PackageX, label: "Processing Orders", value: byStatus("Processing").length + byStatus("Ready for Pickup").length, sub: "Preparing + ready (demo)", tone: "green" },
    { icon: Truck, label: "Out for Delivery", value: byStatus("Out for Delivery").length + byStatus("Shipped").length, sub: "With rider (demo)", tone: "dark" },
    { icon: Bike, label: "Delivered Orders", value: byStatus("Delivered").length, sub: "Completed (demo)", tone: "green" },
    { icon: CircleCheck, label: "Cancelled Orders", value: byStatus("Cancelled").length + byStatus("Rejected").length, sub: "Excluded from revenue (demo)", tone: "red" },
    { icon: Wallet, label: "Today's Order Count", value: today.length, sub: "Non-cancelled, today (demo)", tone: "dark" },
    { icon: BadgeIndianRupee, label: "Today's Order Revenue", value: formatPrice(todayRevenue), sub: "Revenue, not profit (demo)", tone: "green" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {newOnes.length > 0 && (
        <Link to="/admin/orders" className="rounded-2xl bg-[#14532D] px-4 py-3 text-sm font-bold text-white shadow hover:bg-[#16A34A]">
          {newOnes.length} new demo order{newOnes.length === 1 ? "" : "s"} since you last opened the list — review now →
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map((c) => (
          <KpiCard key={c.label} icon={c.icon} label={c.label} value={c.value} sub={c.sub} tone={c.tone} />
        ))}
      </div>

      <div className={card}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-extrabold">Recent orders <span className="text-xs font-medium text-stone-400">(demo)</span></h3>
          <Link to="/admin/orders" className="text-[13px] font-bold text-[#16A34A] hover:underline">Open order management →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-stone-400">No demo orders yet — place one from the storefront to see it here.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {recent.map((o) => (
              <Link key={o.ref} to={`/admin/orders?ref=${o.ref}`} className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#FAFAF5] px-3.5 py-2.5 ring-1 ring-stone-100 hover:bg-green-50">
                <span className="font-mono text-[13px] font-extrabold text-[#14532D]">{o.ref}</span>
                {isNewOrder(o) && <span className="rounded-full bg-[#f97316] px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>}
                <span className="min-w-0 flex-1 truncate text-[13px] text-stone-500">{o.address?.name} • {o.items.reduce((s, i) => s + i.qty, 0)} items</span>
                <span className="text-[13px] font-extrabold">{formatPrice(o.totals?.total)}</span>
                <StatusBadge status={demoStatusOf(o)} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
