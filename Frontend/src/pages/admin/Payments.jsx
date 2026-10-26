import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../data/products";
import { demoStatusOf, getOrders, useDemoVersion } from "../../utils/demoStore";
import { eligibleOrders, summarizeOrders } from "../../utils/finance";
import { inRange, resolveRange } from "../../utils/dateRanges";
import { CsvButton, DateRangePicker, EmptyState, SearchInput, StatusBadge, TableWrap, tdCls, thCls } from "../../components/admin/ui";
import { DarkKpi, SectionHead, glass } from "../../components/admin/dark";
import { useGsapScope } from "../../hooks/useGsap";
import { formatDateTime } from "../../utils/demoStore";

export default function Payments() {
  useDemoVersion();
  const scope = useGsapScope(() => {});
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("All");
  const [payStatus, setPayStatus] = useState("All");
  const [preset, setPreset] = useState("30d");
  const [custom, setCustom] = useState({ start: "", end: "" });

  const range = useMemo(() => resolveRange(preset, custom), [preset, custom]);
  const live = getOrders();
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...live]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((o) => inRange(o.date, range))
      .filter((o) => (method === "All" ? true : o.payment === method))
      .filter((o) => (payStatus === "All" ? true : String(o.paymentStatus || "Pending") === payStatus))
      .filter((o) => {
        if (!needle) return true;
        const a = o.address || {};
        return [o.ref, a.name, a.email].filter(Boolean).join(" ").toLowerCase().includes(needle);
      });
  }, [live, q, method, payStatus, range]);

  const sum = useMemo(() => summarizeOrders(filtered, []), [filtered]);
  const collected = useMemo(
    () => filtered.filter((o) => !/cancel|reject/i.test(demoStatusOf(o)) && /paid/i.test(String(o.paymentStatus || "")))
      .reduce((s, o) => s + (Number(o.totals?.total) || 0), 0),
    [filtered]
  );
  const awaiting = useMemo(
    () => filtered.filter((o) => !/cancel|reject/i.test(demoStatusOf(o)) && !/paid/i.test(String(o.paymentStatus || "")))
      .reduce((s, o) => s + (Number(o.totals?.total) || 0), 0),
    [filtered]
  );
  const methods = useMemo(() => ["All", ...new Set(live.map((o) => o.payment).filter(Boolean))], [live]);

  const csvRows = useMemo(() => ([
    ["Order ref", "Date", "Customer", "Method", "Payment status", "Order status", "Total", "Demo data"],
    ...filtered.map((o) => [o.ref, formatDateTime(o.date), o.address?.name || "", o.payment || "", o.paymentStatus || "Pending", demoStatusOf(o), o.totals?.total ?? "", "yes"]),
  ]), [filtered]);

  return (
    <div ref={scope} className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Money in"
        title="Payment records"
        sub="Demo payment labels from checkout — never real gateway data. Revenue and collected cash are different numbers."
        right={
          <>
            <DateRangePicker preset={preset} onPreset={setPreset} custom={custom} onCustom={setCustom} />
            <CsvButton filename={`freshcart-payments-${preset}-demo.csv`} rows={csvRows} label="Export CSV" />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <DarkKpi icon={({ size }) => <span style={{ fontSize: 18 }}>₹</span>} label="Recorded revenue" value={sum.net} display={formatPrice(sum.net)} sub="Net sales, excl. cancelled (demo)" accent="#5eead4" />
        <DarkKpi icon={({ size }) => <span style={{ fontSize: 18 }}>✓</span>} label="Marked collected" value={collected} display={formatPrice(collected)} sub="Payment status contains Paid (demo)" accent="#34d399" />
        <DarkKpi icon={({ size }) => <span style={{ fontSize: 18 }}>…</span>} label="Awaiting collection" value={awaiting} display={formatPrice(awaiting)} sub="Mostly COD unpaid (demo)" accent="#fbbf24" />
        <DarkKpi icon={({ size }) => <span style={{ fontSize: 18 }}>#</span>} label="Records" value={filtered.length} display={null} sub="In range (demo)" accent="#38bdf8" />
      </div>

      <p className="rounded-2xl bg-sky-400/10 px-4 py-2.5 text-xs text-sky-200 ring-1 ring-sky-300/20">
        Accepting an order never marks it paid. COD stays “Pending” until collection is recorded; card/UPI demo simulations stay labelled “not verified”.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search ref, customer…" />
        <select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Payment method filter" className="w-auto rounded-xl border border-stone-200 bg-[#FAFAF5] px-3.5 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white">
          {methods.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} aria-label="Payment status filter" className="w-auto rounded-xl border border-stone-200 bg-[#FAFAF5] px-3.5 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white">
          {["All", "Pending", "Paid", "Paid (demo — not verified)", "Failed", "Refunded"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="ml-auto self-center text-[13px] text-stone-500">{filtered.length} records (demo)</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No demo payment records" sub="Adjust filters or place a test order from the storefront." />
      ) : (
        <TableWrap>
          <thead><tr>
            <th className={thCls}>Order</th><th className={thCls}>Date</th><th className={thCls}>Customer</th>
            <th className={thCls}>Method</th><th className={thCls}>Payment status</th><th className={thCls}>Total</th>
            <th className={thCls}>Order status</th><th className={thCls}><span className="sr-only">Open</span></th>
          </tr></thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.ref} className="hover:bg-green-50/40">
                <td className={tdCls + " font-mono text-[13px] font-extrabold text-[#14532D]"}>{o.ref}</td>
                <td className={tdCls + " whitespace-nowrap text-xs text-stone-500"}>{formatDateTime(o.date)}</td>
                <td className={tdCls + " text-[13px] font-bold"}>{o.address?.name || "—"}</td>
                <td className={tdCls + " text-[13px]"}>{o.payment}</td>
                <td className={tdCls}><StatusBadge status={o.paymentStatus || "Pending"} /></td>
                <td className={tdCls + " font-extrabold"}>{formatPrice(o.totals?.total)}</td>
                <td className={tdCls}><StatusBadge status={demoStatusOf(o)} /></td>
                <td className={tdCls}>
                  <Link to={`/admin/orders?ref=${o.ref}`} className="rounded-full bg-[#14532D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#16A34A]">Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      {!eligibleOrders(filtered).length && filtered.length > 0 && (
        <div className={`${glass} p-4 text-sm text-slate-300`}>All records in range are cancelled/rejected — excluded from revenue.</div>
      )}
    </div>
  );
}
