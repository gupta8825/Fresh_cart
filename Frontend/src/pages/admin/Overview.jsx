import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, BadgeIndianRupee, Bot, Package, PackageX, ShoppingCart, Users, Wallet,
} from "lucide-react";
import { formatPrice, PRODUCTS, CATEGORIES } from "../../data/products";
import {
  demoStatusOf, filterByAvailability, getCustomers,
  getLowStockThreshold, getOrders, isNewOrder, resolveActive, resolveStock, useDemoVersion,
} from "../../utils/demoStore";
import { getAiRequests } from "../../utils/assistantStore";
import {
  bucketize, eligibleOrders, pctChange, rankCategories, rankProducts,
  statusDistribution, summarizeOrders,
} from "../../utils/finance";
import { granularityFor, inRange, previousRange, resolveRange } from "../../utils/dateRanges";
import { AreaChart, DonutChart, GroupBars, HBarList } from "../../components/admin/Charts";
import { DateRangePicker, StatusBadge, card } from "../../components/admin/ui";
import { DarkEmpty, DarkKpi, SectionHead, glass } from "../../components/admin/dark";
import { useGsapScope } from "../../hooks/useGsap";

const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name || id;

export default function Overview() {
  useDemoVersion();
  const [preset, setPreset] = useState("30d");
  const [custom, setCustom] = useState({ start: "", end: "" });
  const scope = useGsapScope((root) => {
    root.querySelectorAll("[data-enter]").forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(14px)";
      setTimeout(() => {
        el.style.transition = "opacity .5s ease, transform .5s ease";
        el.style.opacity = "1";
        el.style.transform = "none";
      }, 60 * i);
    });
  }, []);

  const range = useMemo(() => resolveRange(preset, custom), [preset, custom]);
  const prev = useMemo(() => previousRange(range), [range]);
  const orders = useMemo(getOrders, []);
  const live = getOrders();
  const inR = useMemo(() => live.filter((o) => inRange(o.date, range)), [live, range]);
  const inP = useMemo(() => live.filter((o) => inRange(o.date, prev)), [live, prev]);
  const sum = useMemo(() => summarizeOrders(inR, []), [inR]);
  const sumPrev = useMemo(() => summarizeOrders(inP, []), [inP]);

  const customers = useMemo(getCustomers, []);
  const catalog = useMemo(
    () => PRODUCTS.map((p) => ({ ...p, stock: resolveStock(p), active: resolveActive(p) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [live]
  );
  const low = useMemo(() => filterByAvailability(catalog, "low", getLowStockThreshold()), [catalog]);
  const out = useMemo(() => filterByAvailability(catalog, "out"), [catalog]);
  const inactive = useMemo(() => filterByAvailability(catalog, "unavailable"), [catalog]);
  const aiReqCount = useMemo(() => {
    try {
      return getAiRequests().length;
    } catch {
      return 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  const buckets = useMemo(
    () => bucketize(inR, { start: range.start, end: range.end, granularity: granularityFor(range) }),
    [inR, range]
  );
  const catRank = useMemo(() => rankCategories(inR, 7), [inR]);
  const topProducts = useMemo(() => rankProducts(inR, 6), [inR]);
  const statusDist = useMemo(() => statusDistribution(inR), [inR]);
  const recent = useMemo(
    () => [...live].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [live]
  );
  const newOnes = useMemo(() => live.filter(isNewOrder), [live]);

  const hasCosts = useMemo(() => catalog.some((p) => p.cost !== undefined && p.cost !== null), [catalog]);
  const valuation = useMemo(
    () => catalog.reduce((s, p) => s + (Number(p.stock) || 0) * (Number(p.cost) || 0), 0),
    [catalog]
  );

  const kpis = [
    { icon: BadgeIndianRupee, label: "Total Revenue", value: sum.net, display: formatPrice(sum.net), sub: "Net sales, excl. cancelled (demo)", accent: "#5eead4", delta: pctChange(sum.net, sumPrev.net) },
    { icon: ShoppingCart, label: "Total Orders", value: sum.orders, sub: `${sum.cancelled} cancelled excluded (demo)`, accent: "#38bdf8", delta: pctChange(sum.orders, sumPrev.orders) },
    { icon: Users, label: "Total Customers", value: customers.length, sub: "Demo directory (demo)", accent: "#a78bfa", delta: null },
    { icon: Package, label: "Total Products", value: catalog.length, sub: "Live catalogue (demo)", accent: "#fbbf24", delta: null },
    { icon: Wallet, label: "Pending Orders", value: live.filter((o) => demoStatusOf(o) === "Pending").length, sub: "Awaiting acceptance (demo)", accent: "#fb7185", delta: null },
    { icon: AlertTriangle, label: "Low-Stock Products", value: low.length, sub: `≤ ${getLowStockThreshold()} units (demo)`, accent: "#fbbf24", delta: null },
    { icon: PackageX, label: "Out-of-Stock Products", value: out.length, sub: "Visible, not purchasable (demo)", accent: "#f87171", delta: null },
    { icon: Bot, label: "AI Shopping Requests", value: aiReqCount, sub: "Local demo log (demo)", accent: "#5eead4", delta: null },
  ];

  return (
    <div ref={scope} className="flex flex-col gap-5">
      <SectionHead
        eyebrow="Overview"
        title="Store overview"
        sub="All metrics derive from live demo orders, catalogue and directory — nothing invented."
        right={<DateRangePicker preset={preset} onPreset={setPreset} custom={custom} onCustom={setCustom} />}
      />

      {newOnes.length > 0 && (
        <Link data-enter to="/admin/orders" className="rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#0d9488] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110">
          {newOnes.length} new demo order{newOnes.length === 1 ? "" : "s"} since you last opened the list — review now →
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map((c) => (
          <div key={c.label} data-enter><DarkKpi {...c} /></div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div data-enter className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">Revenue over time <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
          <div className="mt-3">
            <AreaChart dark points={buckets} xKey="key" series={[{ key: "net", color: "#5eead4", label: "Net sales" }, { key: "orders", color: "#38bdf8", label: "Orders" }]} money={false} />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Net sales in ₹, orders as count. Cancelled orders excluded.</p>
        </div>
        <div data-enter className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">Orders over time <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
          <div className="mt-3">
            <AreaChart dark points={buckets} xKey="key" series={[{ key: "orders", color: "#a78bfa", label: "Orders" }, { key: "units", color: "#fbbf24", label: "Units" }]} money={false} />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Units = total item quantities across eligible orders.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div data-enter className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">Sales by category <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
          <div className="mt-3">
            <DonutChart dark slices={catRank.map((c) => ({ label: catName(c.category), value: Math.round(c.revenue) }))} />
          </div>
        </div>
        <div data-enter className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">Order status <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
          <div className="mt-3">
            <DonutChart dark slices={Object.entries(statusDist).map(([label, value]) => ({ label, value }))} />
          </div>
        </div>
        <div data-enter className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">Best-selling products <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
          <div className="mt-3">
            <HBarList dark rows={topProducts.map((p) => ({ label: p.name, value: Math.round(p.revenue), sub: `${p.units} units` }))} valueFmt={(v) => formatPrice(v)} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div data-enter className={card}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold">Inventory alerts <span className="text-xs font-medium text-stone-400">(demo)</span></h3>
            <Link to="/admin/inventory" className="text-[13px] font-bold text-[#16A34A] hover:underline">Manage stock →</Link>
          </div>
          {low.length + out.length + inactive.length === 0 ? (
            <p className="mt-3 text-sm text-stone-400">All products healthy. Adjust stock from Inventory.</p>
          ) : (
            <ul className="mt-3 max-h-56 space-y-1.5 overflow-y-auto">
              {[...out.map((p) => ({ ...p, flag: "Out of stock" })), ...low.map((p) => ({ ...p, flag: `Low (${p.stock})` })), ...inactive.slice(0, 3).map((p) => ({ ...p, flag: "Inactive" }))].slice(0, 9).map((p) => (
                <li key={p.id} className="flex items-center gap-2 rounded-xl bg-[#FAFAF5] px-3 py-2 text-[13px] ring-1 ring-stone-100">
                  <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                  <span className="shrink-0 text-xs font-bold text-[#f97316]">{p.flag}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[11px] text-stone-400">
            Valuation: {hasCosts ? formatPrice(valuation) : "unavailable — no cost prices recorded"}{" "}
            {hasCosts ? "(recorded costs)" : "(demo)"}. Profit shown only where cost data exists.
          </p>
        </div>
        <div data-enter className={card}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold">Recent orders <span className="text-xs font-medium text-stone-400">(demo)</span></h3>
            <Link to="/admin/orders" className="text-[13px] font-bold text-[#16A34A] hover:underline">Open order management →</Link>
          </div>
          {recent.length === 0 ? (
            <DarkEmpty title="No orders yet" sub="Place one from the storefront to see live records here." />
          ) : (
            <div className="mt-3 space-y-2">
              {recent.map((o) => (
                <Link key={o.ref} to={`/admin/orders?ref=${o.ref}`} className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#FAFAF5] px-3.5 py-2.5 ring-1 ring-stone-100 hover:bg-green-50">
                  <span className="font-mono text-[13px] font-extrabold text-[#14532D]">{o.ref}</span>
                  {isNewOrder(o) && <span className="rounded-full bg-[#f97316] px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>}
                  <span className="min-w-0 flex-1 truncate text-[13px] text-stone-500">{o.address?.name} • {(o.items || []).reduce((s, i) => s + (i.qty || 0), 0)} items</span>
                  <span className="text-[13px] font-extrabold">{formatPrice(o.totals?.total)}</span>
                  <StatusBadge status={demoStatusOf(o)} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {!eligibleOrders(live).length && (
        <DarkEmpty
          title="No eligible orders in this period"
          sub="Cancelled orders are excluded from sales. Broaden the date range or place a demo order from the storefront."
          action={<Link to="/" className="rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">Back to Store</Link>}
        />
      )}
    </div>
  );
}
