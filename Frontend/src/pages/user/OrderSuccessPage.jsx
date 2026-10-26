import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, MapPin, Package, ShoppingBag } from "lucide-react";
import { formatPrice, handleImgError } from "../../data/products";

function loadOrder(ref) {
  try {
    if (ref) {
      const all = JSON.parse(localStorage.getItem("freshcart_orders") || "[]");
      const found = all.find((o) => o.ref === ref);
      if (found) return found;
    }
    return JSON.parse(localStorage.getItem("freshcart_last_order") || "null");
  } catch {
    return null;
  }
}

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const order = loadOrder(state?.ref);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-2xl font-extrabold">No demo order found</h1>
        <p className="mt-2 text-sm text-stone-500">Place an order first, or browse fresh groceries.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-[#16A34A] px-8 py-3 text-sm font-bold text-white hover:bg-[#14532D]">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14 }} className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
        <CheckCircle2 size={52} />
      </motion.div>
      <h1 className="mt-5 text-center text-3xl font-extrabold">Your Demo Order Is Confirmed!</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-stone-500">
        This is a frontend demonstration. No real order or payment has been processed.
      </p>

      <div className="mt-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-stone-200 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-400">Order reference</p>
            <p className="font-mono text-lg font-extrabold text-[#14532D]">{order.ref}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-stone-400">{new Date(order.date).toLocaleString("en-IN")}</p>
            <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-[#14532D]">{order.status}</span>
          </div>
        </div>

        <div className="grid gap-4 py-4 text-sm sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-1.5 font-bold"><MapPin size={15} className="text-[#16A34A]" /> Delivery to</p>
            <p className="mt-1 text-stone-500">{order.address.name}, {order.address.flat}, {order.address.street}, {order.address.city} {order.address.pin}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-bold"><Package size={15} className="text-[#16A34A]" /> Delivery</p>
            <p className="mt-1 text-stone-500">{order.delivery?.name} • {order.delivery?.time}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-bold"><ShoppingBag size={15} className="text-[#16A34A]" /> Payment</p>
            <p className="mt-1 text-stone-500">{order.payment} (demo)</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-dashed border-stone-200 pt-4">
          {order.items.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <img src={it.image} alt={it.name} onError={handleImgError} className="h-12 w-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{it.name}</p>
                <p className="text-xs text-stone-400">Qty {it.qty} × {formatPrice(it.price)}</p>
              </div>
              <span className="text-sm font-extrabold">{formatPrice(it.price * it.qty)}</span>
            </div>
          ))}
        </div>

        <dl className="mt-4 space-y-1.5 border-t border-dashed border-stone-200 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-stone-500">Subtotal</dt><dd className="font-bold">{formatPrice(order.totals.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-stone-500">Coupon discount</dt><dd className="font-bold text-[#16A34A]">−{formatPrice(order.totals.couponOff)}</dd></div>
          <div className="flex justify-between"><dt className="text-stone-500">Delivery</dt><dd className="font-bold">{formatPrice(order.totals.delivery)}</dd></div>
          <div className="flex justify-between pt-2 text-lg"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{formatPrice(order.totals.total)}</dd></div>
        </dl>
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">Estimated demo delivery: {order.delivery?.time}. Track this demo order under My Orders.</p>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <Link to={`/track-order/${order.ref}`} className="rounded-full bg-[#16A34A] py-3 text-center text-sm font-bold text-white hover:bg-[#14532D]">Track My Order</Link>
          <Link to="/orders" className="rounded-full border border-green-200 py-3 text-center text-sm font-bold text-[#14532D] hover:bg-green-50">View My Orders</Link>
          <Link to="/shop" className="rounded-full border border-stone-200 py-3 text-center text-sm font-bold hover:bg-stone-50">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
