import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { Eye, Volume2, VolumeX } from "lucide-react";
import { formatPrice, handleImgError } from "../../data/products";
import {
  PAYMENT_STATUSES, allowedTransitions, customerStatusMessage, demoStatusOf,
  formatDateTime, getAdminSeenAt, getNotifications, getOrders, getSoundPref,
  getUnreadCount, isNewOrder, logActivity, markAdminSeen, markNotificationRead,
  playNewOrderBeep, setPaymentStatus, setSoundPref, updateOrderStatus,
  useDemoVersion,
} from "../../utils/demoStore";
import { inRange, resolveRange } from "../../utils/dateRanges";
import {
  ConfirmDialog, CsvButton, DateRangePicker, EmptyState, Modal, Pager,
  SearchInput, StatusBadge, TableWrap, btnGhost, btnPrimary, card, inputCls, tdCls, thCls,
} from "../../components/admin/ui";
import { useShop } from "../../context/ShopContext";

const PAGE_SIZE = 8;
const STATUS_FILTERS = ["All", "Pending", "Accepted", "Processing", "Ready for Pickup", "Out for Delivery", "Shipped", "Delivered", "Rejected", "Cancelled"];

const ACTION_LABEL = {
  Accepted: "Accept Order",
  Rejected: "Reject Order",
  Processing: "Mark Processing",
  "Ready for Pickup": "Mark Ready for Pickup",
  "Out for Delivery": "Mark Out for Delivery",
  Delivered: "Mark Delivered",
  Cancelled: "Cancel Order",
};
const NEEDS_REASON = new Set(["Rejected", "Cancelled"]);
const NEEDS_CONFIRM = new Set(["Rejected", "Cancelled"]);

export default function Orders() {
  useDemoVersion();
  const { pushToast } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [payMethod, setPayMethod] = useState("All");
  const [payStatus, setPayStatus] = useState("All");
  const [preset, setPreset] = useState("30d");
  const [custom, setCustom] = useState({ start: "", end: "" });
  const [page, setPage] = useState(0);
  const [openRef, setOpenRef] = useState(searchParams.get("ref") || null);
  const [reason, setReason] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [soundOn, setSoundOn] = useState(getSoundPref);
  const prevUnread = useRef(getUnreadCount());

  // Opening the list marks orders as seen (clears NEW highlights).
  useEffect(() => { markAdminSeen(); }, []);

  // Optional new-order beep while this page is open (opt-in, default off).
  const unread = getUnreadCount();
  useEffect(() => {
    if (unread > prevUnread.current) {
      if (getSoundPref()) {
        const ok = playNewOrderBeep();
        pushToast(ok ? "New demo order received (sound on)" : "New demo order received", ok ? "success" : undefined);
      } else {
        pushToast("New demo order received (demo)", "success");
      }
    }
    prevUnread.current = unread;
  }, [unread, pushToast]);

  // Deep link ?ref= opens the drawer and marks its notification read.
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setOpenRef(ref);
      const n = getNotifications().find((x) => x.orderRef === ref && !x.read);
      if (n) markNotificationRead(n.id);
    }
  }, [searchParams]);

  const range = useMemo(() => resolveRange(preset, custom), [preset, custom]);
  const orders = useMemo(getOrders, []);
  // Re-read each render so status changes reflect instantly (same tab).
  const live = getOrders();

  const payMethods = useMemo(() => ["All", ...new Set(live.map((o) => o.payment).filter(Boolean))], [live]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...live]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((o) => (status === "All" ? true : demoStatusOf(o) === status))
      .filter((o) => (payMethod === "All" ? true : o.payment === payMethod))
      .filter((o) => (payStatus === "All" ? true : String(o.paymentStatus || "Pending") === payStatus))
      .filter((o) => inRange(o.date, range))
      .filter((o) => {
        if (!needle) return true;
        const a = o.address || {};
        return [o.ref, a.name, a.email, a.phone, a.city, a.pin].filter(Boolean).join(" ").toLowerCase().includes(needle);
      });
  }, [live, q, status, payMethod, payStatus, range]);

  useEffect(() => { setPage(0); }, [q, status, payMethod, payStatus, preset, custom]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const safePage = Math.min(page, pages - 1);
  const rows = page === safePage ? pageRows : filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const filteredRevenue = filtered
    .filter((o) => !/cancel|reject/i.test(demoStatusOf(o)))
    .reduce((s, o) => s + (Number(o.totals?.total) || 0), 0);

  const openOrder = openRef ? live.find((o) => o.ref === openRef) : null;

  const closeDrawer = () => {
    setOpenRef(null);
    setReason("");
    setConfirmAction(null);
    setSearchParams({}, { replace: true });
  };

  const runAction = (ref, next) => {
    if (NEEDS_REASON.has(next) && !reason.trim()) {
      pushToast(`Add a ${next === "Rejected" ? "rejection" : "cancellation"} reason first (demo record).`, "error");
      return;
    }
    const res = updateOrderStatus(ref, next, { reason: reason.trim() });
    if (!res.ok) {
      pushToast(res.error, "error");
      return;
    }
    setReason("");
    setConfirmAction(null);
    pushToast(`Order ${ref} → ${next} (demo). Customer history updated.`, "success");
  };

  const askAction = (ref, next) => {
    if (NEEDS_CONFIRM.has(next)) setConfirmAction({ ref, next });
    else runAction(ref, next);
  };

  const changePay = (ref, next) => {
    const res = setPaymentStatus(ref, next);
    if (!res.ok) pushToast(res.error, "error");
    else pushToast(`Payment marked ${next} (demo record).`, "success");
  };

  const csvRows = useMemo(() => ([
    ["Order ref", "Date", "Status", "Customer", "Phone", "Email", "City", "PIN", "Items", "Subtotal", "Discount", "Delivery", "Total", "Payment method", "Payment status", "Demo data"],
    ...filtered.map((o) => [
      o.ref, formatDateTime(o.date), demoStatusOf(o), o.address?.name || "", o.address?.phone || "",
      o.address?.email || "", o.address?.city || "", o.address?.pin || "",
      (o.items || []).reduce((s, i) => s + (i.qty || 0), 0),
      o.totals?.subtotal ?? "", (Number(o.totals?.discount) || 0) + (Number(o.totals?.couponOff) || 0),
      o.totals?.delivery ?? "", o.totals?.total ?? "", o.payment || "",
      o.paymentStatus || "Pending", "yes",
    ]),
  ]), [filtered]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search ref, customer, phone…" />
        <DateRangePicker preset={preset} onPreset={setPreset} custom={custom} onCustom={setCustom} />
        <CsvButton filename={`freshcart-orders-${preset}-demo.csv`} rows={csvRows} label="Export CSV" />
        <button
          onClick={() => { const v = !soundOn; setSoundOn(v); setSoundPref(v); pushToast(v ? "New-order sound on (demo)" : "New-order sound off"); }}
          className={btnGhost} aria-pressed={soundOn} title="Demo only — plays a soft beep for new orders while admin pages are open"
        >
          {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />} Sound {soundOn ? "on" : "off"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Order status filter" className={`${inputCls} w-auto`}>
          {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} aria-label="Payment method filter" className={`${inputCls} w-auto`}>
          {payMethods.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} aria-label="Payment status filter" className={`${inputCls} w-auto`}>
          {["All", "Pending", "Paid", "Paid (demo — not verified)", "Failed", "Refunded"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="ml-auto self-center text-[13px] text-stone-500">
          {filtered.length} order{filtered.length === 1 ? "" : "s"} • revenue {formatPrice(filteredRevenue)} <span className="text-stone-400">(excl. cancelled/rejected, demo)</span>
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No demo orders match"
          sub="Try a different search or filter — or place a test order from the storefront."
        />
      ) : (
        <>
          <TableWrap>
            <thead><tr>
              <th className={thCls}>Order</th><th className={thCls}>Customer</th><th className={thCls}>Date</th>
              <th className={thCls}>Items</th><th className={thCls}>Total</th><th className={thCls}>Payment</th>
              <th className={thCls}>Status</th><th className={thCls}><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.ref} className="hover:bg-green-50/40">
                  <td className={tdCls}>
                    <span className="font-mono font-extrabold text-[#14532D]">{o.ref}</span>
                    {isNewOrder(o) && <span className="ml-1.5 rounded-full bg-[#f97316] px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>}
                  </td>
                  <td className={tdCls}><p className="font-bold">{o.address?.name || "—"}</p><p className="text-xs text-stone-400">{o.address?.phone || ""}</p></td>
                  <td className={tdCls + " whitespace-nowrap text-xs text-stone-500"}>{formatDateTime(o.date)}</td>
                  <td className={tdCls}>{(o.items || []).reduce((s, i) => s + (i.qty || 0), 0)}</td>
                  <td className={tdCls + " font-extrabold"}>{formatPrice(o.totals?.total)}</td>
                  <td className={tdCls}><p className="text-[13px]">{o.payment}</p><p className="text-[11px] text-stone-400">{o.paymentStatus || "Pending"}</p></td>
                  <td className={tdCls}><StatusBadge status={demoStatusOf(o)} /></td>
                  <td className={tdCls}>
                    <button onClick={() => { setOpenRef(o.ref); setSearchParams({ ref: o.ref }, { replace: true }); }} className="inline-flex items-center gap-1 rounded-full bg-[#14532D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#16A34A]">
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <Pager page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
        </>
      )}

      <AnimatePresence>
        {openOrder && (
          <Modal key="order-drawer" title={`Order ${openOrder.ref}`} onClose={closeDrawer} wide>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={demoStatusOf(openOrder)} />
              {isNewOrder(openOrder) && <span className="rounded-full bg-[#f97316] px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>}
              <span className="text-xs text-stone-400">{formatDateTime(openOrder.date)} • {openOrder.source || "storefront"} (demo)</span>
            </div>
            <p className="mt-2 rounded-xl bg-green-50 p-2.5 text-[13px] font-semibold text-[#14532D]">{customerStatusMessage(demoStatusOf(openOrder))}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className={card + " !p-4"}>
                <h4 className="text-sm font-extrabold">Customer & delivery</h4>
                <p className="mt-1.5 text-[13px] font-bold">{openOrder.address?.name} <span className="font-normal text-stone-400">{openOrder.address?.phone}</span></p>
                {openOrder.address?.email && <p className="text-[13px] text-stone-500">{openOrder.address.email}</p>}
                <p className="mt-1 text-[13px] text-stone-500">
                  {openOrder.address?.flat}, {openOrder.address?.street}, {openOrder.address?.city}, {openOrder.address?.state} {openOrder.address?.pin}
                </p>
                {openOrder.address?.notes && <p className="mt-1 text-[13px] italic text-stone-500">“{openOrder.address.notes}”</p>}
              </div>
              <div className={card + " !p-4"}>
                <h4 className="text-sm font-extrabold">Payment (demo record)</h4>
                <p className="mt-1.5 text-[13px]">{openOrder.payment} • <b>{openOrder.paymentStatus || "Pending"}</b></p>
                <p className="text-[11px] text-stone-400">No gateway reference exists in demo mode. Status changes here are local records only.</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Pending", "Paid", "Failed", "Refunded"].map((p) => (
                    <button key={p} onClick={() => changePay(openOrder.ref, p)} disabled={(openOrder.paymentStatus || "Pending") === p} className="rounded-full border border-stone-200 px-3 py-1 text-xs font-bold hover:bg-stone-50 disabled:opacity-40">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-3xl bg-white ring-1 ring-stone-100">
              {(openOrder.items || []).map((it) => (
                <div key={it.id} className="flex items-center gap-3 border-b border-stone-50 px-4 py-2.5 last:border-0">
                  <img src={it.image} alt={it.name} onError={handleImgError} className="h-11 w-11 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold">{it.name} <span className="font-normal text-stone-400">• {it.unit}</span></p>
                    <p className="text-[11px] text-stone-400">Qty {it.qty} × {formatPrice(it.price)}</p>
                  </div>
                  <span className="text-[13px] font-extrabold">{formatPrice(it.price * it.qty)}</span>
                </div>
              ))}
              <dl className="space-y-1 px-4 py-3 text-[13px]">
                <div className="flex justify-between"><dt className="text-stone-500">Subtotal</dt><dd className="font-bold">{formatPrice(openOrder.totals?.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-stone-500">Discount{openOrder.coupon ? ` (${openOrder.coupon})` : ""}</dt><dd className="font-bold text-[#16A34A]">−{formatPrice((Number(openOrder.totals?.discount) || 0) + (Number(openOrder.totals?.couponOff) || 0))}</dd></div>
                <div className="flex justify-between"><dt className="text-stone-500">Delivery ({openOrder.delivery?.name})</dt><dd className="font-bold">{formatPrice(openOrder.totals?.delivery)}</dd></div>
                <div className="flex justify-between border-t border-dashed border-stone-200 pt-2 text-base"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{formatPrice(openOrder.totals?.total)}</dd></div>
              </dl>
            </div>

            <div className={card + " mt-3 !p-4"}>
              <h4 className="text-sm font-extrabold">Status history (demo)</h4>
              <ol className="mt-2 space-y-1.5">
                {(openOrder.history || [{ status: openOrder.status, at: openOrder.date }]).map((h, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-2 text-[13px]">
                    <StatusBadge status={h.status} />
                    {h.paymentStatus && <span className="text-[11px] text-stone-400">pay: {h.paymentStatus}</span>}
                    <span className="text-[11px] text-stone-400">{formatDateTime(h.at)}</span>
                    {h.note && <span className="w-full text-xs italic text-stone-500">{h.note}</span>}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-3 rounded-3xl bg-[#FAFAF5] p-4 ring-1 ring-stone-100">
              <h4 className="text-sm font-extrabold">Update status (demo)</h4>
              <p className="mt-0.5 text-[11px] text-stone-400">Customer history + tracking update instantly in this demo. Accepting never marks payment paid.</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {(allowedTransitions(demoStatusOf(openOrder)) || []).map((next) => (
                  <button key={next} onClick={() => askAction(openOrder.ref, next)} className={NEEDS_CONFIRM.has(next) ? "rounded-full border border-red-200 px-4 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50" : btnPrimary + " !py-2"}>
                    {ACTION_LABEL[next] || next}
                  </button>
                ))}
                {(allowedTransitions(demoStatusOf(openOrder)) || []).length === 0 && (
                  <p className="text-[13px] text-stone-400">Terminal state — use Processing reset via list if needed (demo).</p>
                )}
              </div>
              <input
                value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (required to reject / cancel — demo record)"
                aria-label="Status change reason"
                className={`${inputCls} mt-2.5 bg-white`}
              />
            </div>
          </Modal>
        )}
        {confirmAction && (
          <ConfirmDialog
            key="confirm"
            title={`${ACTION_LABEL[confirmAction.next] || confirmAction.next}?`}
            body={`Order ${confirmAction.ref} will be marked "${confirmAction.next}". The customer sees this immediately in the demo. Reason: ${reason.trim() || "—"}`}
            confirmLabel={ACTION_LABEL[confirmAction.next] || "Confirm"}
            onCancel={() => setConfirmAction(null)}
            onConfirm={() => runAction(confirmAction.ref, confirmAction.next)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
