import { Suspense, lazy, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowLeft, BadgeCheck, Banknote, CheckCircle2, Copy, CreditCard,
  Download, MapPin, QrCode, ShieldAlert, Smartphone,
} from "lucide-react";
import CheckoutSteps from "../../components/CheckoutSteps";
import { SceneFallback, isWebGLAvailable } from "../../components/3d/SceneLoader";
import { prefersReducedMotion } from "../../hooks/useGsap";
import { PRODUCTS, formatPrice, handleImgError } from "../../data/products";
import { useShop } from "../../context/ShopContext";
import { clearPendingCheckout, loadPendingCheckout } from "../../utils/pendingCheckout";
import { createOrder, getOrders } from "../../utils/demoStore";
import { validateCartItems } from "../../utils/availability";
import { buildDemoPayload, buildUpiUri, getMerchantUpiId } from "../../utils/upi";

const METHODS = [
  { id: "qr", name: "UPI QR Code", desc: "Scan & pay (demo)", icon: QrCode },
  { id: "upi-app", name: "UPI App", desc: "Open UPI app (demo)", icon: Smartphone },
  { id: "cod", name: "Cash on Delivery", desc: "Pay at your doorstep", icon: Banknote },
  { id: "card", name: "Debit / Credit Card", desc: "Demo only", icon: CreditCard },
];

const METHOD_LABEL = {
  cod: "Cash on Delivery",
  qr: "UPI QR (demo — not verified)",
  "upi-app": "UPI App (demo — not verified)",
  card: "Card (demo — not verified)",
};

const Payment3DScene = lazy(() => import("../../components/3d/Payment3DScene"));

export default function PaymentPage() {
  const { cart, clearCart, pushToast } = useShop();
  const navigate = useNavigate();
  const qrBoxRef = useRef(null);
  const [pending] = useState(loadPendingCheckout);
  const [method, setMethod] = useState("qr");
  const [placing, setPlacing] = useState(false);
  const [copied, setCopied] = useState(false);
  // Decorative 3D only on capable devices; hidden on small screens for perf.
  // The QR code itself always stays flat HTML so it remains scannable.
  const [show3D] = useState(() => {
    try {
      return !prefersReducedMotion() && isWebGLAvailable();
    } catch {
      return false;
    }
  });

  const merchantUpiId = useMemo(getMerchantUpiId, []);
  const upiConfigured = merchantUpiId !== "";

  const items = pending?.items || [];
  const totals = pending?.totals;

  const qrValue = useMemo(() => {
    if (!pending) return "";
    if (upiConfigured) {
      return buildUpiUri({ upiId: merchantUpiId, amount: pending.totals.total, ref: pending.ref });
    }
    return buildDemoPayload({ ref: pending.ref, amount: pending.totals.total });
  }, [pending, upiConfigured, merchantUpiId]);

  if (!pending || !totals || items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">No pending payment</h1>
        <p className="mt-2 text-sm text-stone-500">
          Complete the checkout form first — your payment details appear here after validation.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/checkout" className="rounded-full bg-[#16A34A] px-6 py-3 text-sm font-bold text-white hover:bg-[#14532D]">Back to Checkout</Link>
          <Link to="/shop" className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-bold hover:bg-stone-50">Shop</Link>
        </div>
      </div>
    );
  }

  const copyDetails = async () => {
    const text = [
      `FreshCart demo payment`,
      `Ref: ${pending.ref}`,
      `Amount: ${formatPrice(totals.total)}`,
      upiConfigured ? `UPI ID: ${merchantUpiId}` : `Demo payload (no merchant UPI configured)`,
      `Method: ${METHOD_LABEL[method] || method}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      ta.remove();
    }
    setCopied(true);
    pushToast("Payment details copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = qrBoxRef.current?.querySelector("canvas");
    if (!canvas) {
      pushToast("QR not ready yet", "error");
      return;
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${pending.ref}-demo-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const createDemoOrder = (paymentLabel) => {
    if (placing) return;
    // Duplicate-click safety: same ref must never create two orders.
    try {
      const prev = getOrders();
      if (prev.some((o) => o.ref === pending.ref)) {
        clearPendingCheckout();
        navigate("/order-success", { state: { ref: pending.ref } });
        return;
      }
    } catch { /* ignore */ }
    // Final live availability check — stock may have changed since checkout.
    const liveLines = items.map((it) => ({ it, product: PRODUCTS.find((p) => p.id === it.id), qty: it.qty }));
    const missing = liveLines.filter((x) => !x.product);
    const liveIssues = validateCartItems(liveLines.filter((x) => x.product));
    if (missing.length > 0 || liveIssues.length > 0) {
      const parts = [
        ...missing.map((x) => `${x.it.name} (no longer listed)`),
        ...liveIssues.map((i) => i.type === "unavailable" ? `${i.name} (${i.label})` : `${i.name} (only ${i.stock} available)`),
      ];
      pushToast(`Cannot place order: ${parts.join("; ")}`, "error");
      navigate("/cart");
      return;
    }
    setPlacing(true);
    setTimeout(() => {
      // Payment status is recorded explicitly per method — never inferred.
      // COD stays unpaid until collection; demo simulations stay labelled.
      const paymentStatus = method === "cod" ? "Pending" : "Paid (demo — not verified)";
      const order = createOrder({
        items: items.map((it) => ({ id: it.id, name: it.name, image: it.image, price: it.price, qty: it.qty, unit: it.unit })),
        totals,
        coupon: pending.coupon || null,
        address: { ...pending.address },
        delivery: { ...pending.delivery },
        payment: paymentLabel,
        paymentStatus,
      });
      // createOrder assigns the unique ref; follow it for this session.
      const ref = order.ref;
      try {
        localStorage.setItem("freshcart_last_order", JSON.stringify(order));
        if (pending.saveAddr) localStorage.setItem("freshcart_address", JSON.stringify(pending.address));
        localStorage.removeItem("freshcart_coupon");
      } catch { /* ignore */ }
      // Sanity: only clear the cart after the demo order is stored.
      clearCart();
      clearPendingCheckout();
      setPlacing(false);
      pushToast("Demo order created — no real payment processed");
      navigate("/order-success", { state: { ref } });
    }, 900);
  };

  const cartMismatch = cart.length > 0 && cart.reduce((s, i) => s + i.qty, 0) !== items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <CheckoutSteps current={2} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Payment <span className="text-sm font-medium text-stone-400">(demo)</span></h1>
          <p className="mt-1 text-sm text-stone-500">
            Order ref <span className="font-mono font-bold text-[#14532D]">{pending.ref}</span> • Payable <b className="text-stone-900">{formatPrice(totals.total)}</b>
          </p>
        </div>
        <Link to="/checkout" className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-bold text-[#14532D] hover:bg-green-50">
          <ArrowLeft size={16} /> Back to Checkout
        </Link>
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-[13px] text-amber-800 ring-1 ring-amber-100">
        <ShieldAlert size={18} className="mt-0.5 shrink-0" />
        Frontend demonstration only. No real payment is collected or verified here — marking anything “paid” is a local demo simulation. Never enter real card or banking details.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          {show3D && (
            <div aria-hidden="true" className="pointer-events-none hidden h-44 overflow-hidden rounded-3xl bg-gradient-to-r from-green-100 via-[#FAFAF5] to-orange-100 ring-1 ring-stone-100 sm:block">
              <Suspense fallback={<SceneFallback label="Loading 3D decoration…" />}>
                <Payment3DScene />
              </Suspense>
            </div>
          )}
          {/* method selection */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
            <h2 className="text-base font-extrabold">Choose payment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="group" aria-label="Payment method">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={`rounded-2xl border-2 p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] ${method === m.id ? "border-[#16A34A] bg-green-50" : "border-stone-100 hover:border-green-200"}`}
                >
                  <m.icon size={22} className="text-[#14532D]" />
                  <p className="mt-2 text-sm font-extrabold">{m.name}</p>
                  <p className="text-xs text-stone-500">{m.desc}</p>
                </button>
              ))}
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" /> Status: Awaiting payment (demo)
            </p>
          </section>

          {/* UPI QR */}
          {method === "qr" && (
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-6 text-center ring-1 ring-stone-100">
              <h2 className="text-base font-extrabold">Scan with any supported UPI app</h2>
              <p className="mt-1 text-sm text-stone-500">
                Amount <b className="text-2xl text-stone-900">{formatPrice(totals.total)}</b> • Ref <span className="font-mono font-bold">{pending.ref}</span>
              </p>
              <div ref={qrBoxRef} className="mx-auto mt-5 w-fit rounded-3xl border-2 border-dashed border-green-200 bg-white p-5">
                <QRCodeCanvas value={qrValue} size={220} level="M" includeMargin aria-label={`Demo payment QR for order ${pending.ref}`} />
              </div>
              {!upiConfigured ? (
                <p className="mx-auto mt-4 max-w-md rounded-2xl bg-stone-100 p-3 text-xs leading-relaxed text-stone-500">
                  Demo QR — no merchant UPI ID is configured (<code>VITE_UPI_ID</code>). This code encodes the demo
                  order reference and amount as text; it does <b>not</b> request money from anyone.
                </p>
              ) : (
                <p className="mx-auto mt-4 max-w-md rounded-2xl bg-green-50 p-3 text-xs leading-relaxed text-[#14532D]">
                  Encodes a standard UPI payment URI for <b>{merchantUpiId}</b> ({formatPrice(totals.total)}). Scanning
                  or generating it does <b>not</b> confirm any payment — verification needs a gateway + backend.
                </p>
              )}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button onClick={downloadQR} className="inline-flex items-center gap-1.5 rounded-full border border-green-200 px-5 py-2.5 text-sm font-bold text-[#14532D] hover:bg-green-50">
                  <Download size={16} /> Download QR Code
                </button>
                <button onClick={copyDetails} className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-5 py-2.5 text-sm font-bold hover:bg-stone-50">
                  {copied ? <CheckCircle2 size={16} className="text-[#16A34A]" /> : <Copy size={16} />} {copied ? "Copied!" : "Copy Payment Details"}
                </button>
              </div>
              <button
                onClick={() => createDemoOrder(METHOD_LABEL.qr)}
                disabled={placing}
                className="mt-4 w-full rounded-full bg-[#16A34A] py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D] disabled:opacity-60 sm:mx-auto sm:max-w-sm"
              >
                {placing ? "Recording demo…" : "Simulate Successful Payment (Demo)"}
              </button>
              <p className="mt-2 text-[11px] text-stone-400">Simulation only — use it to preview order confirmation. Nothing is verified.</p>
            </motion.section>
          )}

          {/* UPI App */}
          {method === "upi-app" && (
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
              <h2 className="flex items-center gap-2 text-base font-extrabold"><Smartphone size={19} className="text-[#16A34A]" /> Pay with a UPI app</h2>
              <p className="mt-1 text-sm text-stone-500">Payable <b>{formatPrice(totals.total)}</b> • Ref <span className="font-mono font-bold">{pending.ref}</span></p>
              {upiConfigured ? (
                <>
                  <p className="mt-3 text-[13px] text-stone-500">This opens your UPI app with the amount pre-filled. Opening the app does not mark anything paid.</p>
                  <a
                    href={qrValue}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-7 py-3 text-sm font-bold text-white hover:bg-[#14532D]"
                  >
                    <Smartphone size={16} /> Open UPI App • {formatPrice(totals.total)}
                  </a>
                </>
              ) : (
                <p className="mt-3 rounded-2xl bg-stone-100 p-4 text-[13px] leading-relaxed text-stone-500">
                  No merchant UPI ID is configured (<code>VITE_UPI_ID</code>), so the UPI-app deep link is disabled in
                  this demo. No real transaction can occur. Use the QR-code tab instead, or choose Cash on Delivery.
                </p>
              )}
              <div>
                <button
                  onClick={() => createDemoOrder(METHOD_LABEL["upi-app"])}
                  disabled={placing}
                  className="mt-4 w-full rounded-full border-2 border-[#14532D] py-3 text-sm font-bold text-[#14532D] hover:bg-green-50 disabled:opacity-50"
                >
                  {placing ? "Recording demo…" : "Simulate Successful Payment (Demo)"}
                </button>
              </div>
            </motion.section>
          )}

          {/* COD */}
          {method === "cod" && (
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
              <h2 className="flex items-center gap-2 text-base font-extrabold"><Banknote size={19} className="text-[#16A34A]" /> Cash on Delivery</h2>
              <p className="mt-1 text-sm text-stone-500">
                Pay <b>{formatPrice(totals.total)}</b> at your doorstep: {pending.address.flat}, {pending.address.street}, {pending.address.city} {pending.address.pin}.
              </p>
              <button
                onClick={() => createDemoOrder(METHOD_LABEL.cod)}
                disabled={placing}
                className="mt-4 w-full rounded-full bg-[#16A34A] py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D] disabled:opacity-60"
              >
                {placing ? "Placing your demo order…" : `Place Demo Order • ${formatPrice(totals.total)}`}
              </button>
              <p className="mt-2 text-center text-[11px] text-stone-400">Frontend demo only. No server, no real payment.</p>
            </motion.section>
          )}

          {/* Card demo */}
          {method === "card" && (
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
              <h2 className="flex items-center gap-2 text-base font-extrabold">
                <CreditCard size={19} className="text-[#16A34A]" /> Debit / Credit Card <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-[#f97316]">DEMO ONLY</span>
              </h2>
              <p className="mt-2 flex items-start gap-2 rounded-2xl bg-orange-50 p-4 text-[13px] leading-relaxed text-orange-800">
                <BadgeCheck size={17} className="mt-0.5 shrink-0" />
                No real gateway is integrated, so this demo collects no card number, CVV, or expiry — there are no
                card fields on purpose. Real card payments need a PCI-compliant gateway + backend verification.
              </p>
              <button
                onClick={() => createDemoOrder(METHOD_LABEL.card)}
                disabled={placing}
                className="mt-4 w-full rounded-full bg-[#16A34A] py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D] disabled:opacity-60"
              >
                {placing ? "Recording demo…" : `Simulate Card Payment • ${formatPrice(totals.total)} (Demo)`}
              </button>
            </motion.section>
          )}
        </div>

        {/* summary */}
        <aside className="h-fit rounded-3xl bg-white p-6 ring-1 ring-stone-100 lg:sticky lg:top-32">
          <h3 className="text-base font-extrabold">Order Summary</h3>
          <p className="mt-1 flex items-start gap-1.5 text-xs text-stone-400">
            <MapPin size={13} className="mt-0.5 shrink-0" />
            {pending.address.name}, {pending.address.flat}, {pending.address.street}, {pending.address.city} {pending.address.pin}
          </p>
          {cartMismatch && (
            <p className="mt-2 rounded-xl bg-amber-50 p-2.5 text-[11px] text-amber-700">
              Your cart changed after checkout — this summary shows the validated checkout items.
            </p>
          )}
          <div className="mt-3 flex max-h-64 flex-col gap-2.5 overflow-y-auto pr-1">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-2.5">
                <img src={it.image} alt={it.name} onError={handleImgError} className="h-11 w-11 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{it.name}</p>
                  <p className="text-[11px] text-stone-400">Qty {it.qty} × {formatPrice(it.price)}</p>
                </div>
                <span className="text-[13px] font-extrabold">{formatPrice(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-2 border-t border-dashed border-stone-200 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Subtotal</dt><dd className="font-bold">{formatPrice(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Coupon {pending.coupon ? `(${pending.coupon})` : ""}</dt><dd className="font-bold text-[#16A34A]">−{formatPrice(totals.couponOff)}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Delivery ({pending.delivery.name})</dt><dd className="font-bold">{totals.delivery === 0 ? <span className="text-[#16A34A]">FREE</span> : formatPrice(totals.delivery)}</dd></div>
            <div className="flex justify-between border-t border-dashed border-stone-200 pt-3 text-base"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{formatPrice(totals.total)}</dd></div>
          </dl>
          <p className="mt-2 text-center text-[11px] text-stone-400">Same pricing as checkout • {PRODUCTS.length} products in catalogue</p>
        </aside>
      </div>
    </div>
  );
}
