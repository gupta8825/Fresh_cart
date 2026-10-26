import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { formatPrice, PRODUCTS } from "../../data/products";
import { getCustomers, getExpenses, getOrders, useDemoVersion } from "../../utils/demoStore";
import {
  bucketize, eligibleOrders, orderFinance, pctChange, rankCategories,
  rankProducts, statusDistribution, summarizeOrders,
} from "../../utils/finance";
import { granularityFor, inRange, previousRange, resolveRange, TIMEZONE_NOTE } from "../../utils/dateRanges";
import { AreaChart, ChartEmpty, DonutChart, GroupBars, HBarList } from "../../components/admin/Charts";
import { CsvButton, DateRangePicker } from "../../components/admin/ui";
import { DarkEmpty, DarkKpi, SectionHead, glass } from "../../components/admin/dark";
import { downloadCSV } from "../../utils/demoStore";
import { useGsapScope } from "../../hooks/useGsap";

const catName = (id) => (PRODUCTS.find((p) => p.category === id)?.category
  ? ({ atta: "Atta, Flour & Grains", rice: "Rice & Basmati", dal: "Dal, Pulses & Beans", oil: "Cooking Oil", spices: "Masala & Spices", "salt-sugar": "Salt, Sugar & Jaggery", biscuits: "Biscuits & Rusks", namkeen: "Namkeen & Snacks", noodles: "Noodles & Pasta", beverages: "Tea, Coffee & Drinks", packaged: "Packaged Mixes", dryfruits: "Dry Fruits & Nuts", sauces: "Sauces & Pickles", cleaning: "Cleaning & Household", personal: "Personal Care", pooja: "Pooja Essentials" }[id] || id)
  : id);

export default function Analytics() {
  useDemoVersion();
  const [preset, setPreset] = useState("30d");
  const [custom, setCustom] = useState({ start: "", end: "" });
  const scope = useGsapScope(() => {});

  const range = useMemo(() => resolveRange(preset, custom), [preset, custom]);
  const prev = useMemo(() => previousRange(range), [range]);
  const live = getOrders();
  const inR = useMemo(() => live.filter((o) => inRange(o.date, range)), [live, range]);
  const inP = useMemo(() => live.filter((o) => inRange(o.date, prev)), [live, prev]);
  const sum = useMemo(() => summarizeOrders(inR, getExpenses()), [inR]);
  const sumPrev = useMemo(() => summarizeOrders(inP, getExpenses()), [inP]);
  const expenses = useMemo(getExpenses, []);

  const buckets = useMemo(
    () => bucketize(inR, { start: range.start, end: range.end, granularity: granularityFor(range) }),
    [inR, range]
  );
  const expInRange = useMemo(
    () => expenses.filter((e) => inRange(e.date, range)).reduce((s, e) => s + (Number(e.amount) || 0), 0),
    [expenses, range]
  );

  const customers = useMemo(getCustomers, []);
  const newCustomers = useMemo(() => customers.filter((c) => !c.sample && inRange(c.joined, range)), [customers, range]);
  const emailCounts = useMemo(() => {
    const m = {};
    eligibleOrders(inR).forEach((o) => {
      const em = String(o.address?.email || o.customerEmail || "").toLowerCase();
      if (em) m[em] = (m[em] || 0) + 1;
    });
    return m;
  }, [inR]);
  const repeatEmails = Object.values(emailCounts).filter((n) => n > 1).length;
  const repeatOrders = eligibleOrders(inR).filter((o) => {
    const em = String(o.address?.email || o.customerEmail || "").toLowerCase();
    return em && (emailCounts[em] || 0) > 1;
  }).length;

  const catRank = useMemo(() => rankCategories(inR, 10), [inR]);
  const topProducts = useMemo(() => rankProducts(inR, 8), [inR]);
  const statusDist = useMemo(() => statusDistribution(inR), [inR]);

  const today = useMemo(() => {
    const n = new Date();
    return inR.filter((o) => {
      const d = new Date(o.date);
      return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
    });
  }, [inR]);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const inMonth = useMemo(() => live.filter((o) => new Date(o.date) >= monthStart), [live]);
  const inYear = useMemo(() => live.filter((o) => new Date(o.date) >= yearStart), [live]);
  const sumMonth = useMemo(() => summarizeOrders(inMonth, []), [inMonth]);
  const sumYear = useMemo(() => summarizeOrders(inYear, []), [inYear]);
  const sumToday = useMemo(() => summarizeOrders(today, []), [today]);

  const csvRows = useMemo(() => ([
    ["Metric", "Value"],
    ["Range", `${range.start.toLocaleDateString("en-IN")} – ${range.end.toLocaleDateString("en-IN")}`],
    ["Gross sales (INR)", sum.gross],
    ["Net sales (INR)", sum.net],
    ["Discounts (INR)", sum.discounts],
    ["COGS estimated (INR)", sum.cogs],
    ["Gross profit estimated (INR)", sum.grossProfit],
    ["Expenses in range (INR)", expInRange],
    ["Net profit estimated (INR)", sum.grossProfit - expInRange],
    ["Orders", sum.orders],
    ["Units", sum.units],
    ["Cancelled excluded", sum.cancelled],
    ["Cost fallback used", sum.usedCostFallback ? "yes" : "no"],
    ["Demo data", "yes"],
  ]), [sum, expInRange, range]);

  const kpis = [
    { label: "Gross Sales", value: sum.gross, display: formatPrice(sum.gross), sub: "Before discounts (demo)", accent: "#5eead4", delta: pctChange(sum.gross, sumPrev.gross) },
    { label: "Net Sales", value: sum.net, display: formatPrice(sum.net), sub: "After discounts (demo)", accent: "#38bdf8", delta: pctChange(sum.net, sumPrev.net) },
    { label: "Total Orders", value: sum.orders, display: null, sub: "Eligible in range (demo)", accent: "#a78bfa", delta: pctChange(sum.orders, sumPrev.orders) },
    { label: "Units Sold", value: sum.units, display: null, sub: "Item quantities (demo)", accent: "#fbbf24", delta: pctChange(sum.units, sumPrev.units) },
    { label: "Average Order Value", value: sum.aov, display: formatPrice(Math.round(sum.aov)), sub: "Net ÷ orders (demo)", accent: "#5eead4", delta: pctChange(sum.aov, sumPrev.aov) },
    { label: "Product Cost (COGS)", value: sum.cogs, display: formatPrice(sum.cogs), sub: sum.usedCostFallback ? "Estimated — costs not recorded" : "Recorded snapshots (demo)", accent: "#f97316", delta: pctChange(sum.cogs, sumPrev.cogs) },
    { label: "Gross Profit (est.)", value: sum.grossProfit, display: formatPrice(Math.round(sum.grossProfit)), sub: "Net − COGS (demo)", accent: "#34d399", delta: pctChange(sum.grossProfit, sumPrev.grossProfit) },
    { label: "Operating Expenses", value: expInRange, display: formatPrice(expInRange), sub: "Demo entries in range", accent: "#fb7185", delta: null },
    { label: "Net Profit (est.)", value: sum.grossProfit - expInRange, display: formatPrice(Math.round(sum.grossProfit - expInRange)), sub: "Gross profit − expenses (demo)", accent: "#34d399", delta: pctChange(sum.grossProfit - expInRange, sumPrev.grossProfit - expInRange) },
    { label: "Profit Margin", value: sum.margin, display: `${sum.margin.toFixed(1)}%`, sub: "Net profit ÷ net (demo)", accent: "#38bdf8", delta: pctChange(sum.margin, sumPrev.margin) },
    { label: "Total Discounts", value: sum.discounts, display: formatPrice(sum.discounts), sub: "MRP + coupon (demo)", accent: "#fbbf24", delta: pctChange(sum.discounts, sumPrev.discounts) },
    { label: "Refunds", value: 0, display: "₹0", sub: "Refunds not supported by demo model", accent: "#94a3b8", delta: 0 },
  ];

  return (
    <div ref={scope} className="flex flex-col gap-5">
      <SectionHead
        eyebrow="Analytics"
        title="Sales & profit analytics"
        sub={`Demo data — not actual business performance. ${TIMEZONE_NOTE}`}
        right={
          <>
            <DateRangePicker preset={preset} onPreset={setPreset} custom={custom} onCustom={setCustom} />
            <CsvButton filename={`freshcart-analytics-${preset}-demo.csv`} rows={csvRows} label="Export CSV" />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map((c) => (
          <DarkKpi key={c.label} icon={Wallet} label={c.label} value={c.value} display={c.display} sub={c.sub} accent={c.accent} delta={c.delta} />
        ))}
      </div>
      {sum.usedCostFallback && (
        <p className="rounded-2xl bg-amber-400/10 px-4 py-2.5 text-xs text-amber-200 ring-1 ring-amber-300/20">
          Cost fallback active: some lines lack recorded cost snapshots, so COGS uses 70% of selling price. Profit figures are estimates — record cost prices on products for exact accounting.
        </p>
      )}
      {sum.hasPending && (
        <p className="rounded-2xl bg-sky-400/10 px-4 py-2.5 text-xs text-sky-200 ring-1 ring-sky-300/20">
          Pending orders are included in sales totals (flagged here); cancelled orders are excluded.
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <div className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">Revenue & orders <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
          <div className="mt-3">
            <AreaChart dark points={buckets} xKey="key" series={[{ key: "net", color: "#5eead4", label: "Net sales" }, { key: "orders", color: "#a78bfa", label: "Orders" }]} money={false} />
          </div>
        </div>
        <div className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">Profit & loss <span className="text-xs font-medium text-slate-400">(demo, estimated)</span></h3>
          <div className="mt-3">
            <GroupBars dark points={buckets} xKey="key" bars={[{ key: "net", color: "#34d399", label: "Net" }, { key: "cogs", color: "#f97316", label: "COGS" }]} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px] sm:grid-cols-3">
            {[["Revenue", sum.net], ["COGS", sum.cogs], ["Gross profit", sum.grossProfit], ["Expenses", expInRange], ["Net profit (est.)", sum.grossProfit - expInRange], ["Margin", null]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                <dt className="text-[11px] text-slate-400">{k}</dt>
                <dd className="font-extrabold text-white">{k === "Margin" ? `${sum.margin.toFixed(1)}%` : formatPrice(Math.round(v))}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className={`${glass} p-4 sm:p-5`}>
        <h3 className="font-extrabold text-white">Today • Month • Year <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
        <div className="mt-3 grid gap-2 text-[13px] sm:grid-cols-3">
          {[
            ["Today", sumToday],
            ["This month", sumMonth],
            ["This year", sumYear],
          ].map(([label, s]) => (
            <div key={label} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300">{label}</p>
              <p className="mt-1 text-xl font-extrabold text-white">{formatPrice(s.net)}</p>
              <p className="mt-1 text-xs text-slate-400">{s.orders} orders • {s.units} units • est. profit {formatPrice(Math.round(s.grossProfit))}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">Top-selling products <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
          <div className="mt-3">
            <HBarList dark rows={topProducts.map((p) => {
              const prod = PRODUCTS.find((x) => x.id === p.id);
              const cost = prod && prod.cost != null ? Number(prod.cost) : null;
              return { label: p.name, value: Math.round(p.revenue), sub: `${p.units} units${cost != null ? ` • est. profit ${formatPrice(Math.round(p.revenue - cost * p.units))}` : ""}` };
            })} valueFmt={(v) => formatPrice(v)} />
          </div>
        </div>
        <div className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">Category performance <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
          <div className="mt-3">
            <DonutChart dark slices={catRank.map((c) => ({ label: catName(c.category), value: Math.round(c.revenue) }))} />
          </div>
          <div className="mt-3">
            <HBarList dark rows={catRank.slice(0, 5).map((c) => ({ label: catName(c.category), value: Math.round(c.revenue), sub: `${c.units} units` }))} valueFmt={(v) => formatPrice(v)} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">Orders & customers <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
            {[["Orders in range", sum.orders], ["New demo customers", newCustomers.length], ["Repeat-customer orders", repeatOrders], ["Avg order value", formatPrice(Math.round(sum.aov))]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                <dt className="text-[11px] text-slate-400">{k}</dt>
                <dd className="font-extrabold text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3">
            <DonutChart dark slices={Object.entries(statusDist).map(([label, value]) => ({ label, value }))} height={170} />
          </div>
        </div>
        <div className={`${glass} p-4 sm:p-5`}>
          <h3 className="font-extrabold text-white">How to read this <span className="text-xs font-medium text-slate-400">(demo)</span></h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-slate-300">
            <li>Every figure derives from shared demo orders, catalogue snapshots and the demo directory — change the date range and everything recalculates.</li>
            <li>Cancelled orders never count toward sales; pending orders are included and flagged.</li>
            <li>Profit is estimated unless products carry recorded cost prices and expenses are logged.</li>
            <li>Customer identities are demo samples; counts exclude duplicates by email.</li>
          </ul>
          <Link to="/admin/reports" className="mt-4 inline-block rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">Export reports →</Link>
        </div>
      </div>

      {eligibleOrders(inR).length === 0 && (
        <DarkEmpty
          title="No eligible orders in this range"
          sub="Broaden the date range or place a demo order from the storefront."
          action={<Link to="/" className="rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">Back to Store</Link>}
        />
      )}
    </div>
  );
}
