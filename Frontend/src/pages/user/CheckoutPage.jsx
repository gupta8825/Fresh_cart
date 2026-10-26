import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronRight, Truck, Zap } from "lucide-react";
import CheckoutSteps from "../../components/CheckoutSteps";
import { PRODUCTS, formatPrice } from "../../data/products";
import { useShop } from "../../context/ShopContext";
import { EXPRESS_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE, cartTotals } from "../../utils/pricing";
import { loadPendingCheckout, savePendingCheckout } from "../../utils/pendingCheckout";
import { validateCartItems } from "../../utils/availability";

const DELIVERY = [
  { id: "standard", name: "Standard Delivery", time: "2–4 hours", fee: "dynamic", icon: Truck, note: `Free over ₹${FREE_DELIVERY_THRESHOLD}, else ₹${STANDARD_DELIVERY_FEE} (demo)` },
  { id: "express", name: "Express Delivery", time: "60 minutes", fee: EXPRESS_DELIVERY_FEE, icon: Zap, note: "Priority doorstep delivery (demo)" },
];

const field = "w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100";

export default function CheckoutPage() {
  const { cart, pushToast } = useShop();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [delivery, setDelivery] = useState("standard");
  const [coupon] = useState(() => {
    try { return localStorage.getItem("freshcart_coupon") || ""; } catch { return ""; }
  });
  const [form, setForm] = useState(() => {
    // Prefer the pending-payment draft (Back from /payment) over the saved demo address.
    try {
      const pendingAddr = loadPendingCheckout()?.address;
      if (pendingAddr) return { landmark: "", notes: "", ...pendingAddr };
      const saved = JSON.parse(localStorage.getItem("freshcart_address") || "null");
      return saved || { name: "", email: "", phone: "", flat: "", street: "", landmark: "", city: "", state: "", pin: "", notes: "" };
    } catch { return { name: "", email: "", phone: "", flat: "", street: "", landmark: "", city: "", state: "", pin: "", notes: "" }; }
  });
  const [saveAddr, setSaveAddr] = useState(false);

  const detailed = useMemo(() =>
    cart.map((ci) => ({ ...ci, product: PRODUCTS.find((p) => p.id === ci.id) })).filter((x) => x.product),
  [cart]);

  const deliveryFee = useMemo(() => {
    if (detailed.length === 0) return 0;
    if (delivery === "express") return EXPRESS_DELIVERY_FEE;
    const sub = detailed.reduce((s, x) => s + x.product.price * x.qty, 0);
    return sub >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  }, [delivery, detailed]);

  const totals = useMemo(() => cartTotals(cart, PRODUCTS, coupon || null, deliveryFee), [cart, coupon, deliveryFee]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email.";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit mobile number.";
    if (!form.flat.trim()) e.flat = "Required.";
    if (!form.street.trim()) e.street = "Required.";
    if (!form.city.trim()) e.city = "Required.";
    if (!form.state.trim()) e.state = "Required.";
    if (!/^\d{6}$/.test(form.pin.trim())) e.pin = "Enter a valid 6-digit PIN code.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const proceedToPayment = () => {
    if (detailed.length === 0) {
      pushToast("Your cart is empty", "error");
      navigate("/shop");
      return;
    }
    // Re-validate live availability — stock may have changed since cart.
    const stockIssues = validateCartItems(detailed);
    if (stockIssues.length > 0) {
      pushToast(
        `Fix these items in your cart first: ${stockIssues.map((i) => i.type === "unavailable" ? `${i.name} (${i.label})` : `${i.name} (only ${i.stock} available)`).join("; ")}`,
        "error"
      );
      navigate("/cart");
      return;
    }
    if (!validate()) {
      pushToast("Please fix the highlighted fields", "error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // No order is created here — the snapshot is validated checkout data only.
    const chosen = DELIVERY.find((d) => d.id === delivery);
    const snapshot = {
      ref: `FC${Date.now().toString().slice(-8)}`,
      items: detailed.map(({ product, qty }) => ({ id: product.id, name: product.name, image: product.image, price: product.price, qty, unit: product.unit })),
      totals,
      coupon: coupon || null,
      address: { ...form },
      saveAddr,
      delivery: { id: chosen.id, name: chosen.name, time: chosen.time, note: chosen.note },
    };
    if (!savePendingCheckout(snapshot)) {
      pushToast("Could not start payment (browser storage unavailable)", "error");
      return;
    }
    navigate("/payment");
  };

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-stone-500">Add some fresh groceries before checking out.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-[#16A34A] px-8 py-3 text-sm font-bold text-white hover:bg-[#14532D]">Back to Shop</Link>
      </div>
    );
  }

  const err = (k) => errors[k] && <p className="mt-1 text-xs font-medium text-red-600">{errors[k]}</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1.5 text-[13px] text-stone-400">
        <Link to="/" className="hover:text-[#16A34A]">Home</Link>
        <ChevronRight size={14} />
        <Link to="/cart" className="hover:text-[#16A34A]">Cart</Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-stone-700">Checkout</span>
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">Checkout</h1>
      <p className="mt-1 text-sm text-stone-500">Demo checkout — no real payment or order is processed.</p>
      <div className="mt-4"><CheckoutSteps current={1} /></div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          {/* contact */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
            <h2 className="flex items-center gap-2 text-base font-extrabold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#16A34A] text-xs text-white">1</span> Contact Information</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div><input value={form.name} onChange={set("name")} placeholder="Full name *" className={field} />{err("name")}</div>
              <div><input value={form.email} onChange={set("email")} placeholder="Email *" className={field} />{err("email")}</div>
              <div><input value={form.phone} onChange={set("phone")} placeholder="Mobile (10-digit) *" maxLength={10} className={field} />{err("phone")}</div>
            </div>
          </section>

          {/* address */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
            <h2 className="flex items-center gap-2 text-base font-extrabold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#16A34A] text-xs text-white">2</span> Delivery Address</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><input value={form.flat} onChange={set("flat")} placeholder="House / Flat no. *" className={field} />{err("flat")}</div>
              <div><input value={form.street} onChange={set("street")} placeholder="Street & locality *" className={field} />{err("street")}</div>
              <div><input value={form.landmark} onChange={set("landmark")} placeholder="Landmark (optional)" className={field} /></div>
              <div><input value={form.city} onChange={set("city")} placeholder="City *" className={field} />{err("city")}</div>
              <div><input value={form.state} onChange={set("state")} placeholder="State *" className={field} />{err("state")}</div>
              <div><input value={form.pin} onChange={set("pin")} placeholder="PIN code *" maxLength={6} className={field} />{err("pin")}</div>
              <div className="sm:col-span-2"><input value={form.notes} onChange={set("notes")} placeholder="Delivery instructions (optional)" className={field} /></div>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} className="h-4 w-4 accent-[#16A34A]" />
              Save this address for the demo
            </label>
          </section>

          {/* delivery */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
            <h2 className="flex items-center gap-2 text-base font-extrabold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#16A34A] text-xs text-white">3</span> Delivery Options <span className="text-xs font-medium text-stone-400">(demo pricing)</span></h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DELIVERY.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDelivery(d.id)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${delivery === d.id ? "border-[#16A34A] bg-green-50" : "border-stone-100 hover:border-green-200"}`}
                >
                  <d.icon size={22} className="text-[#16A34A]" />
                  <p className="mt-2 text-sm font-extrabold">{d.name}</p>
                  <p className="text-xs text-stone-500">{d.time} • {d.note}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* summary */}
        <aside className="h-fit rounded-3xl bg-white p-6 ring-1 ring-stone-100 lg:sticky lg:top-32">
          <h3 className="text-base font-extrabold">Order Summary</h3>
          <div className="mt-3 flex max-h-64 flex-col gap-2.5 overflow-y-auto pr-1">
            {detailed.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-2.5">
                <img src={product.image} alt={product.name} className="h-11 w-11 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{product.name}</p>
                  <p className="text-[11px] text-stone-400">Qty {qty} × {formatPrice(product.price)}</p>
                </div>
                <span className="text-[13px] font-extrabold">{formatPrice(product.price * qty)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-2 border-t border-dashed border-stone-200 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Subtotal</dt><dd className="font-bold">{formatPrice(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Coupon {coupon ? `(${coupon})` : ""}</dt><dd className="font-bold text-[#16A34A]">−{formatPrice(totals.couponOff)}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Delivery</dt><dd className="font-bold">{totals.delivery === 0 ? <span className="text-[#16A34A]">FREE</span> : formatPrice(totals.delivery)}</dd></div>
            <div className="flex justify-between border-t border-dashed border-stone-200 pt-3 text-base"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{formatPrice(totals.total)}</dd></div>
          </dl>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={proceedToPayment}
            className="mt-5 w-full rounded-full bg-[#16A34A] py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D]"
          >
            {`Proceed to Payment • ${formatPrice(totals.total)}`}
          </motion.button>
          <p className="mt-2 text-center text-[11px] text-stone-400">Next: choose a demo payment method. No order is created yet.</p>
        </aside>
      </div>
    </div>
  );
}
