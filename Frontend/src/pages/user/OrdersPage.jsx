import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PackageOpen } from "lucide-react";
import { formatPrice, handleImgError } from "../../data/products";

export function getAllOrders() {
  try {
    const raw = JSON.parse(localStorage.getItem("freshcart_orders") || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

const FILTERS = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

// Demo status derivation: checkout stores "Demo Confirmed"; map it into the
// filterable demo lifecycle. All statuses are labelled demo.
function demoStatus(o) {
  const s = String(o.status || "Demo Confirmed");
  if (/cancel/i.test(s)) return "Cancelled";
  if (/deliver/i.test(s)) return "Delivered";
  if (/ship/i.test(s)) return "Shipped";
  return "Processing";
}

export default function OrdersPage() {
  const [filter, setFilter] = useState("All");
  const orders = useMemo(getAllOrders, []);

  const visible = useMemo(
    () => (filter === "All" ? orders : orders.filter((o) => demoStatus(o) === filter)),
    [orders, filter]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">My Orders <span className="text-sm font-medium text-stone-400">(demo)</span></h1>
      <p className="mt-1 text-sm text-stone-500">Frontend-only demo orders stored in your browser. Not real purchases.</p>

      {orders.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                filter === f ? "bg-[#16A34A] text-white shadow" : "bg-white text-stone-500 ring-1 ring-stone-200 hover:bg-green-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center ring-1 ring-stone-100 sm:p-14">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
            <PackageOpen size={34} />
          </span>
          <h2 className="mt-4 font-extrabold">No orders yet</h2>
          <p className="mt-1 text-sm text-stone-500">Your demo orders will appear here after checkout.</p>
          <Link to="/shop" className="mt-5 inline-block rounded-full bg-[#16A34A] px-7 py-3 text-sm font-bold text-white hover:bg-[#14532D]">Start Shopping</Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center ring-1 ring-stone-100 sm:p-14">
          <h2 className="font-extrabold">No {filter.toLowerCase()} orders</h2>
          <p className="mt-1 text-sm text-stone-500">Try a different demo status filter.</p>
          <button onClick={() => setFilter("All")} className="mt-5 rounded-full bg-[#16A34A] px-7 py-3 text-sm font-bold text-white hover:bg-[#14532D]">Show all orders</button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {visible.map((o) => (
            <div key={o.ref} className="rounded-3xl bg-white p-5 ring-1 ring-stone-100 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono font-extrabold text-[#14532D]">{o.ref}</p>
                  <p className="text-xs text-stone-400">{new Date(o.date).toLocaleString("en-IN")} • {o.items.reduce((s, i) => s + i.qty, 0)} items</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-[#14532D]">{demoStatus(o)} (demo)</span>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {o.items.map((it) => (
                  <img key={it.id} src={it.image} alt={it.name} title={it.name} onError={handleImgError} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-stone-200 pt-3 text-sm">
                <span className="text-stone-500">{o.payment} • {o.delivery?.name}</span>
                <span className="flex flex-wrap items-center gap-3">
                  <span className="text-base font-extrabold">{formatPrice(o.totals.total)}</span>
                  <Link to={`/track-order/${o.ref}`} className="inline-flex items-center gap-1 rounded-full bg-[#16A34A] px-4 py-2 text-xs font-bold text-white hover:bg-[#14532D]">
                    Track <ArrowRight size={13} />
                  </Link>
                  <Link to={`/orders/${o.ref}`} className="inline-flex items-center gap-1 rounded-full bg-[#14532D] px-4 py-2 text-xs font-bold text-white hover:bg-[#16A34A]">
                    View Details <ArrowRight size={13} />
                  </Link>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
