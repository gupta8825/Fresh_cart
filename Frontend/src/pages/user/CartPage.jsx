import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronRight, ShoppingCart, Tag, Trash2, X } from "lucide-react";
import ProductSection from "../../components/ProductSection";
import { QtyStepper } from "../../components/ProductCard";
import { PRODUCTS, formatPrice, handleImgError } from "../../data/products";
import { validateCartItems } from "../../utils/availability";
import { useShop } from "../../context/ShopContext";
import { COUPONS, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE, cartTotals, isCouponUsable } from "../../utils/pricing";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart, pushToast } = useShop();
  const [coupon, setCoupon] = useState(() => {
    try { return localStorage.getItem("freshcart_coupon") || ""; } catch { return ""; }
  });
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState({ type: "", text: "" });
  const [confirmClear, setConfirmClear] = useState(false);
  const navigate = useNavigate();

  const detailed = useMemo(() =>
    cart.map((ci) => ({ ...ci, product: PRODUCTS.find((p) => p.id === ci.id) })).filter((x) => x.product),
  [cart]);

  // Live availability check — items stay in the cart, checkout is blocked
  // until the customer removes or fixes them. Nothing is removed silently.
  const issues = useMemo(() => validateCartItems(detailed), [detailed]);
  const issueById = useMemo(() => Object.fromEntries(issues.map((i) => [i.id, i])), [issues]);

  const totals = useMemo(
    () => cartTotals(cart, PRODUCTS, coupon || null, detailed.length === 0 ? 0 : subtotalFee(detailed)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, coupon, detailed]
  );

  function subtotalFee(items) {
    const sub = items.reduce((s, x) => s + x.product.price * x.qty, 0);
    return sub === 0 || sub >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  }

  const recommended = useMemo(() => {
    const inCart = new Set(cart.map((i) => i.id));
    return PRODUCTS.filter((p) => !inCart.has(p.id) && p.stock > 0).sort((a, b) => b.rating - a.rating).slice(0, 4);
  }, [cart]);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const c = COUPONS[code];
    if (!c) {
      setCouponMsg({ type: "error", text: `"${code}" is not a valid demo coupon. Try FRESH10 or WELCOME50.` });
      return;
    }
    if (coupon === code) {
      setCouponMsg({ type: "error", text: "This coupon is already applied." });
      return;
    }
    if (!isCouponUsable(c)) {
      setCouponMsg({ type: "error", text: `${code} is expired, inactive, or fully used (demo).` });
      return;
    }
    if (totals.subtotal < (c.minOrder || 0)) {
      setCouponMsg({ type: "error", text: `${code} needs a minimum order of ₹${c.minOrder}.` });
      return;
    }
    setCoupon(code);
    try { localStorage.setItem("freshcart_coupon", code); } catch { /* ignore */ }
    setCouponMsg({ type: "success", text: `${code} applied! ${c.label}. (Demo)` });
    setCouponInput("");
    pushToast(`Coupon ${code} applied`);
  };

  const removeCoupon = () => {
    setCoupon("");
    try { localStorage.removeItem("freshcart_coupon"); } catch { /* ignore */ }
    setCouponMsg({ type: "", text: "" });
  };

  const progress = Math.min(100, Math.round((totals.subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
          <ShoppingCart size={40} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">Your cart is empty</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-stone-500">Looks like you haven't added anything fresh yet. Let's fix that!</p>
        <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#14532D]">
          Shop Now <ArrowRight size={16} />
        </Link>
        <div className="mt-10 text-left">
          <ProductSection id="cart-empty-rec" eyebrow="Popular" title="Recommended for you" products={PRODUCTS.slice(0, 4)} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1.5 text-[13px] text-stone-400">
        <Link to="/" className="hover:text-[#16A34A]">Home</Link>
        <ChevronRight size={14} /> <span className="font-semibold text-stone-700">Cart</span>
      </nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Your Shopping Cart</h1>
          <p className="mt-1 text-sm text-stone-500">{detailed.length} item{detailed.length > 1 ? "s" : ""} • Fresh and ready for checkout</p>
        </div>
        <button onClick={() => setConfirmClear(true)} className="rounded-full border border-red-200 px-4 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50">
          Clear Cart
        </button>
      </div>

      {/* free delivery progress */}
      <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-stone-100">
        <p className="text-[13px] font-semibold">
          {totals.subtotal >= FREE_DELIVERY_THRESHOLD
            ? "You've unlocked FREE standard delivery!"
            : <>Add <b className="text-[#16A34A]">{formatPrice(FREE_DELIVERY_THRESHOLD - totals.subtotal)}</b> more for FREE delivery</>}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
          <motion.div animate={{ width: `${progress}%` }} className="h-full rounded-full bg-[#16A34A]" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-3">
          {issues.length > 0 && (
            <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200" role="alert">
              <p className="text-sm font-extrabold text-amber-800">Some items need attention before checkout</p>
              <ul className="mt-2 space-y-2">
                {issues.map((iss) => (
                  <li key={iss.id} className="flex flex-wrap items-center gap-2 text-[13px] text-amber-800">
                    <span className="min-w-0 flex-1">
                      <b>{iss.name}</b> — {iss.type === "unavailable" ? iss.label : `only ${iss.stock} available (you have ${iss.qty})`}
                    </span>
                    {iss.type === "exceeds" && (
                      <button onClick={() => updateQty(iss.id, iss.stock)} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#14532D] ring-1 ring-amber-200 hover:bg-green-50">
                        Set to max ({iss.stock})
                      </button>
                    )}
                    <button onClick={() => { removeFromCart(iss.id); pushToast(`${iss.name} removed`); }} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-red-500 ring-1 ring-red-200 hover:bg-red-50">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <AnimatePresence initial={false}>
            {detailed.map(({ product, qty }) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 80 }}
                className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100"
              >
                <Link to={`/product/${product.id}`} className="shrink-0">
                  <img src={product.image} alt={product.name} onError={handleImgError} className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A]">{product.category}</p>
                  <Link to={`/product/${product.id}`} className="truncate text-[15px] font-bold hover:text-[#16A34A]">{product.name}</Link>
                  <p className="text-xs text-stone-400">{product.unit} • {formatPrice(product.price)} each • {product.stock} in stock</p>
                  {issueById[product.id] && (
                    <p className="mt-1 text-xs font-bold text-amber-700">
                      {issueById[product.id].type === "unavailable"
                        ? `${issueById[product.id].label} — remove to continue`
                        : `Only ${issueById[product.id].stock} available — lower the quantity or remove`}
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <QtyStepper
                      qty={qty}
                      max={product.stock}
                      onChange={(q) => (q === 0 ? (removeFromCart(product.id), pushToast(`${product.name} removed`)) : updateQty(product.id, q))}
                    />
                    <span className="text-base font-extrabold">{formatPrice(product.price * qty)}</span>
                  </div>
                </div>
                <button onClick={() => { removeFromCart(product.id); pushToast(`${product.name} removed`); }} className="self-start rounded-lg p-2 text-stone-300 hover:bg-red-50 hover:text-red-500" aria-label="Remove item">
                  <Trash2 size={17} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <button onClick={() => navigate("/shop")} className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-bold text-[#14532D] hover:bg-green-50">
            <ArrowLeft size={16} /> Continue Shopping
          </button>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-100 lg:sticky lg:top-32">
          <h3 className="text-base font-extrabold">Order Summary</h3>
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="w-full rounded-full border border-stone-200 bg-[#FAFAF5] py-2.5 pl-10 pr-3 text-sm font-semibold outline-none focus:border-[#16A34A]"
              />
            </div>
            <button onClick={applyCoupon} className="rounded-full bg-[#14532D] px-5 text-sm font-bold text-white hover:bg-[#16A34A]">Apply</button>
          </div>
          {couponMsg.text && (
            <p className={`mt-2 text-[13px] font-medium ${couponMsg.type === "error" ? "text-red-600" : "text-[#16A34A]"}`}>{couponMsg.text}</p>
          )}
          {coupon && (
            <button onClick={removeCoupon} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-[#14532D] hover:bg-green-200">
              {coupon} applied <X size={13} />
            </button>
          )}
          <p className="mt-2 text-[11px] text-stone-400">Demo coupons: FRESH10 • WELCOME50</p>

          <dl className="mt-4 space-y-2.5 border-t border-dashed border-stone-200 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Subtotal</dt><dd className="font-bold">{formatPrice(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">MRP discount</dt><dd className="font-bold text-[#16A34A]">−{formatPrice(totals.discount)}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Coupon discount</dt><dd className="font-bold text-[#16A34A]">−{formatPrice(totals.couponOff)}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Delivery fee</dt><dd className="font-bold">{totals.delivery === 0 ? <span className="text-[#16A34A]">FREE</span> : formatPrice(totals.delivery)}</dd></div>
            <div className="flex justify-between border-t border-dashed border-stone-200 pt-3 text-base"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{formatPrice(totals.total)}</dd></div>
          </dl>
          <motion.button
            whileTap={issues.length === 0 ? { scale: 0.97 } : undefined}
            onClick={() => {
              if (issues.length > 0) {
                pushToast(`Resolve unavailable items first: ${issues.map((i) => i.name).join(", ")}`, "error");
                return;
              }
              navigate("/checkout");
            }}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold shadow-lg ${
              issues.length > 0
                ? "cursor-not-allowed bg-stone-200 text-stone-400 shadow-none"
                : "bg-[#16A34A] text-white shadow-green-200 hover:bg-[#14532D]"
            }`}
          >
            Proceed to Checkout <ArrowRight size={16} />
          </motion.button>
          {issues.length > 0 && (
            <p className="mt-2 text-center text-xs font-semibold text-amber-700">
              Checkout is blocked until unavailable items are removed or fixed.
            </p>
          )}
        </aside>
      </div>

      {recommended.length > 0 && (
        <div className="mt-8">
          <ProductSection id="cart-rec" eyebrow="Complete your basket" title="Recommended products" products={recommended} />
        </div>
      )}

      <AnimatePresence>
        {confirmClear && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmClear(false)} className="absolute inset-0 bg-black/50" />
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
              <h3 className="text-lg font-extrabold">Clear your cart?</h3>
              <p className="mt-1 text-sm text-stone-500">All {detailed.length} items will be removed. This can't be undone.</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button onClick={() => setConfirmClear(false)} className="rounded-full border border-stone-200 py-2.5 text-sm font-bold hover:bg-stone-50">Keep items</button>
                <button onClick={() => { clearCart(); removeCoupon(); setConfirmClear(false); pushToast("Cart cleared"); }} className="rounded-full bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600">Clear all</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
