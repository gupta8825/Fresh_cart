import { useMemo, useState } from "react";
import { formatPrice, PRODUCTS } from "../../data/products";
import {
  downloadCSV,
  formatDateTime,
  getAnalyticsOrders,
  getExpenses,
  getOrders,
  useDemoVersion,
} from "../../utils/demoStore";
import { eligibleOrders, summarizeOrders } from "../../utils/finance";
import { inRange, resolveRange } from "../../utils/dateRanges";
import { CsvButton, DateRangePicker, ExpensePanel, card } from "../../components/admin/ui";
import { SectionHead, glass } from "../../components/admin/dark";
import { useGsapScope } from "../../hooks/useGsap";

export default function Reports() {
  useDemoVersion();
  const scope = useGsapScope(() => {});
  const [preset, setPreset] = useState("30d");
  const [custom, setCustom] = useState({ start: "", end: "" });
  const [, setTick] = useState(0);

  const range = useMemo(() => resolveRange(preset, custom), [preset, custom]);
  const live = getOrders();
  const analyticsOrders = useMemo(() => getAnalyticsOrders(PRODUCTS), [live]);
  const inR = useMemo(() => live.filter((o) => inRange(o.date, range)), [live, range]);
  const sum = useMemo(() => summarizeOrders(inR, []), [inR]);
  const expenses = useMemo(() => getExpenses(), [live]);

  const orderRows = useMemo(
    () => [
      ["Order ref", "Date", "Customer", "Items", "Total", "Status", "Demo data"],
      ...inR.map((o) => [
        o.ref,
        formatDateTime(o.date),
        o.address?.name || "",
        (o.items || []).reduce((s, i) => s + (i.qty || 0), 0),
        o.totals?.total ?? "",
        o.status || "",
        o.sample ? "sample" : "yes",
      ]),
    ],
    [inR]
  );

  const productSales = useMemo(() => {
    const map = new Map();
    eligibleOrders(analyticsOrders.filter((o) => inRange(o.date, range))).forEach((o) =>
      (o.items || []).forEach((it) => {
        const cur = map.get(it.id) || { name: it.name, units: 0, revenue: 0 };
        cur.units += it.qty || 0;
        cur.revenue += (it.price || 0) * (it.qty || 0);
        map.set(it.id, cur);
      })
    );
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [analyticsOrders, range]);

  const productRows = useMemo(
    () => [
      ["Product", "Units", "Revenue", "Demo data"],
      ...productSales.map((p) => [p.name, p.units, Math.round(p.revenue), "yes"]),
    ],
    [productSales]
  );

  return (
    <div ref={scope} className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Exports"
        title="Reports"
        sub="Summaries + CSV export from live demo orders. Nothing invented — samples are labelled."
        right={
          <>
            <DateRangePicker preset={preset} onPreset={setPreset} custom={custom} onCustom={setCustom} />
            <CsvButton filename={`freshcart-orders-${preset}-demo.csv`} rows={orderRows} label="Orders CSV" />
            <CsvButton filename={`freshcart-products-${preset}-demo.csv`} rows={productRows} label="Products CSV" />
          </>
        }
      />

      <div className={`${glass} p-4 sm:p-5`}>
        <p className="text-sm font-bold text-white">
          {inR.length} orders in range • net {formatPrice(sum.net)} • {sum.units || 0} units{" "}
          <span className="font-medium text-slate-400">(cancelled excluded, demo)</span>
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Range {range.start?.slice(0, 10)} → {range.end?.slice(0, 10)}. Real + labelled sample orders feed product sales.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => downloadCSV(`freshcart-orders-${preset}-demo.csv`, orderRows)}
            className="rounded-full bg-[#16A34A] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#14532D]"
          >
            Download orders CSV
          </button>
          <button
            onClick={() => downloadCSV(`freshcart-products-${preset}-demo.csv`, productRows)}
            className="rounded-full border border-white/20 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/10"
          >
            Download product sales CSV
          </button>
        </div>
      </div>

      <div className={card}>
        <h3 className="font-extrabold">
          Top products in range <span className="text-xs font-medium text-stone-400">(demo)</span>
        </h3>
        {productSales.length === 0 ? (
          <p className="mt-2 text-sm text-stone-400">No eligible orders in this range.</p>
        ) : (
          <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto">
            {productSales.slice(0, 12).map((p) => (
              <li
                key={p.name}
                className="flex items-center gap-2 rounded-xl bg-[#FAFAF5] px-3 py-2 text-[13px] ring-1 ring-stone-100"
              >
                <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                <span className="text-xs text-stone-400">{p.units} units</span>
                <b>{formatPrice(Math.round(p.revenue))}</b>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ExpensePanel expenses={expenses} onChanged={() => setTick((t) => t + 1)} />
    </div>
  );
}
