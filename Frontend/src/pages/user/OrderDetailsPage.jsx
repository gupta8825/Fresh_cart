import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, MapPin, Package, ShoppingBag } from "lucide-react";
import { formatPrice, handleImgError } from "../../data/products";
import { getAllOrders } from "./OrdersPage";

const STAGES = ["Processing", "Shipped", "Delivered"];

function stageIndex(status) {
  const s = String(status || "");
  if (/deliver/i.test(s)) return 2;
  if (/ship/i.test(s)) return 1;
  return 0;
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const order = getAllOrders().find((o) => o.ref === id);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-6xl">📦</p>
        <h1 className="mt-4 text-2xl font-extrabold">Order not found</h1>
        <p className="mt-2 text-sm text-stone-500">
          No demo order matches “{id}”. It may have been cleared from this browser.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/orders" className="rounded-full bg-[#16A34A] px-6 py-3 text-sm font-bold text-white hover:bg-[#14532D]">Order History</Link>
          <Link to="/shop" className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-bold hover:bg-stone-50">Shop</Link>
        </div>
      </div>
    );
  }

  const idx = stageIndex(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-400 hover:text-[#16A34A]">
        <ArrowLeft size={15} /> Back to orders
      </Link>
      <div className="mt-3 flex justify-end">
        <Link to={`/track-order/${order.ref}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">
          <MapPin size={15} /> Track Delivery (demo)
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-extrabold text-[#14532D]">{order.ref}</h1>
          <p className="mt-1 text-sm text-stone-500">
            Placed {new Date(order.date).toLocaleString("en-IN")} • Demo order, not a real purchase.
          </p>
        </div>
        <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold text-[#14532D]">{order.status} (demo)</span>
      </div>

      <div className="mt-5 rounded-3xl bg-white p-6 ring-1 ring-stone-100">
        <h2 className="text-sm font-extrabold">Delivery progress (demo)</h2>
        <div className="mt-4 flex items-center">
          {STAGES.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${i <= idx ? "bg-[#16A34A] text-white" : "bg-stone-100 text-stone-300"}`}>
                  {i <= idx ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                </span>
                <span className={`text-[11px] font-bold ${i <= idx ? "text-[#14532D]" : "text-stone-300"}`}>{s}</span>
              </div>
              {i < STAGES.length - 1 && <span className={`mx-2 h-0.5 flex-1 rounded ${i < idx ? "bg-[#16A34A]" : "bg-stone-100"}`} />}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-400">Simulated timeline — no live tracking. Estimated: {order.delivery?.time}.</p>
      </div>

      <div className="mt-5 rounded-3xl bg-white p-6 ring-1 ring-stone-100">
        <h2 className="text-sm font-extrabold">Items ({order.items.reduce((s, i) => s + i.qty, 0)})</h2>
        <div className="mt-3 flex flex-col gap-3">
          {order.items.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <img src={it.image} alt={it.name} onError={handleImgError} className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <Link to={`/product/${it.id}`} className="block truncate text-sm font-bold hover:text-[#16A34A]">{it.name}</Link>
                <p className="text-xs text-stone-400">Qty {it.qty} × {formatPrice(it.price)}{it.unit ? ` • ${it.unit}` : ""}</p>
              </div>
              <span className="text-sm font-extrabold">{formatPrice(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
        <dl className="mt-4 space-y-1.5 border-t border-dashed border-stone-200 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-stone-500">Subtotal</dt><dd className="font-bold">{formatPrice(order.totals.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-stone-500">Discount{order.coupon ? ` (${order.coupon})` : ""}</dt><dd className="font-bold text-[#16A34A]">−{formatPrice((order.totals.discount || 0) + (order.totals.couponOff || 0))}</dd></div>
          <div className="flex justify-between"><dt className="text-stone-500">Delivery</dt><dd className="font-bold">{order.totals.delivery === 0 ? "FREE" : formatPrice(order.totals.delivery)}</dd></div>
          <div className="flex justify-between pt-2 text-lg"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{formatPrice(order.totals.total)}</dd></div>
        </dl>
      </div>

      <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-100">
          <p className="flex items-center gap-1.5 font-bold"><MapPin size={15} className="text-[#16A34A]" /> Delivery address</p>
          <p className="mt-1.5 text-stone-500">{order.address.name}, {order.address.flat}, {order.address.street}, {order.address.city} {order.address.pin}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-100">
          <p className="flex items-center gap-1.5 font-bold"><Package size={15} className="text-[#16A34A]" /> Delivery method</p>
          <p className="mt-1.5 text-stone-500">{order.delivery?.name} • {order.delivery?.time} (demo)</p>
        </div>
        <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-100">
          <p className="flex items-center gap-1.5 font-bold"><ShoppingBag size={15} className="text-[#16A34A]" /> Payment</p>
          <p className="mt-1.5 text-stone-500">{order.payment} (demo — no payment processed)</p>
        </div>
      </div>
    </div>
  );
}
