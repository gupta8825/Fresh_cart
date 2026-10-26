import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft, Bike, CheckCircle2, ChevronDown, Circle, Clock3, MapPin,
  Navigation, Package, Phone, ShoppingBag,
} from "lucide-react";
import { demoStatusOf, getOrders, useDemoVersion } from "../../utils/demoStore";
import {
  TRACK_STAGES, demoDurationMin, destinationFor, etaLabel, loadProgress,
  riderFor, saveProgress, simStageFor, stageIndexFor,
} from "../../utils/tracking";
import { SceneFallback } from "../../components/3d/SceneLoader";

const TrackingMap = lazy(() => import("../../components/TrackingMap"));

// Full demo run: 120s from dispatch to doorstep (predictable + testable).
const SIM_TICKS = 120;

export default function TrackOrderPage() {
  const { id } = useParams();
  useDemoVersion(); // re-render when the admin updates the order status
  const order = getOrders().find((o) => o.ref === id);

  const adminStage = order ? stageIndexFor(order) : 0;
  const terminal = adminStage === 5 || adminStage === -1;
  const running = !!order && !terminal && (adminStage === 2 || adminStage === 4 || adminStage === 1);

  const [progress, setProgress] = useState(() => (terminal ? 1 : loadProgress(id)));

  // Controlled simulation tick: advances only while visible + in transit.
  useEffect(() => {
    if (!running) return;
    if (adminStage === 1) return; // Pending: wait for demo confirmation, rider stays at hub
    const t = setInterval(() => {
      if (document.hidden) return; // pause when the tab is not active
      setProgress((p) => {
        const next = Math.min(0.95, +(p + 1 / SIM_TICKS).toFixed(4)); // sim never declares delivery
        saveProgress(id, next);
        return next;
      });
    }, 1000);
    return () => clearInterval(t); // cleanup on unmount / route change
  }, [running, adminStage, id]);

  const simStage = useMemo(() => simStageFor(progress), [progress]);
  const stage = !order ? 0 : terminal ? adminStage : Math.max(adminStage, simStage);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-6xl">🗺️</p>
        <h1 className="mt-4 text-2xl font-extrabold">Order not found</h1>
        <p className="mt-2 text-sm text-stone-500">No demo order matches “{id}”. Tracking needs a valid order ID.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/orders" className="rounded-full bg-[#16A34A] px-6 py-3 text-sm font-bold text-white hover:bg-[#14532D]">Order History</Link>
          <Link to="/shop" className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-bold hover:bg-stone-50">Shop</Link>
        </div>
      </div>
    );
  }

  const rider = riderFor(order.ref);
  const dest = destinationFor(order.ref);
  const status = demoStatusOf(order);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link to={`/orders/${order.ref}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-400 hover:text-[#16A34A]">
        <ArrowLeft size={15} /> Back to order details
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-extrabold text-[#14532D]">{order.ref}</h1>
          <p className="mt-1 text-sm text-stone-500">
            Placed {new Date(order.date).toLocaleString("en-IN")} • {order.delivery?.name} ({order.delivery?.time}, demo)
          </p>
        </div>
        <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold text-[#14532D]">{status} (demo)</span>
      </div>

      <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-2.5 text-xs text-amber-800 ring-1 ring-amber-100">
        Demo tracking — simulated rider location on sample Mumbai coordinates. Not real GPS tracking; no courier is connected.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* ETA */}
          <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-[#14532D] p-5 text-white">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Clock3 size={24} />
            </span>
            <div>
              <p className="text-lg font-extrabold">{etaLabel(order, progress, stage)}</p>
              <p className="text-xs text-green-200">
                {stage === 5 ? "Enjoy your groceries!" : stage === -1 ? `This demo order was ${status === "Rejected" ? "not accepted" : "cancelled"}.` : `Demo duration ~${demoDurationMin(order)} min • ${Math.round(progress * 100)}% of demo route`}
              </p>
            </div>
            {running && adminStage !== 1 && (
              <div className="ml-auto h-2 w-full overflow-hidden rounded-full bg-white/20 sm:w-48">
                <motion.div className="h-full rounded-full bg-green-300" animate={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            )}
          </div>

          {/* map */}
          <div className="overflow-hidden rounded-3xl ring-1 ring-stone-200">
            <div className="h-[340px] w-full sm:h-[420px]">
              <Suspense fallback={<SceneFallback label="Loading demo map…" />}>
                <TrackingMap orderRef={order.ref} progress={terminal ? 1 : progress} />
              </Suspense>
            </div>
            <p className="bg-white px-4 py-2.5 text-[11px] text-stone-400">
              Illustrative straight-line demo route (not a road route) • Destination is illustrative, not geocoded from the delivery address.
            </p>
          </div>

          {/* timeline */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
            <h2 className="flex items-center gap-2 text-base font-extrabold"><Package size={18} className="text-[#16A34A]" /> Delivery timeline (demo)</h2>
            <ol className="mt-4 flex flex-col gap-0">
              {TRACK_STAGES.map((s, i) => {
                const done = stage !== -1 && i <= stage;
                const current = stage !== -1 && i === stage;
                return (
                  <li key={s} className="flex gap-3">
                    <span className="flex flex-col items-center">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${done ? "bg-[#16A34A] text-white" : "bg-stone-100 text-stone-300"}`}>
                        {done ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                      </span>
                      {i < TRACK_STAGES.length - 1 && <span className={`h-6 w-0.5 rounded ${done ? "bg-[#16A34A]" : "bg-stone-100"}`} />}
                    </span>
                    <span className="pb-5">
                      <span className={`block text-sm font-bold ${done ? "text-stone-900" : "text-stone-300"}`}>{s}</span>
                      <span className="block text-[11px] text-stone-400">
                        {i === 0 ? new Date(order.date).toLocaleString("en-IN") : current ? "In progress — simulated" : done ? "Completed (simulated)" : "Pending"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
            {stage === -1 && <p className="rounded-xl bg-red-50 p-3 text-[13px] font-semibold text-red-600">This demo order was {status === "Rejected" ? "not accepted" : "cancelled"}. Tracking stopped — no payment was collected.</p>}
            {adminStage === 1 && <p className="rounded-xl bg-stone-100 p-3 text-[13px] text-stone-500">Order is pending demo confirmation — the rider stays at the hub until then.</p>}
          </section>

          {/* mobile collapsible details */}
          <details className="rounded-3xl bg-white ring-1 ring-stone-100 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-extrabold">
              Order items ({order.items.reduce((s, i) => s + i.qty, 0)}) <ChevronDown size={17} />
            </summary>
            <div className="flex flex-col gap-2.5 px-5 pb-5">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate font-semibold">{it.name} × {it.qty}</span>
                </div>
              ))}
            </div>
          </details>
        </div>

        <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-32">
          {/* rider */}
          <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-100">
            <h3 className="flex items-center gap-2 text-sm font-extrabold"><Bike size={17} className="text-[#16A34A]" /> Your rider (demo)</h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-extrabold text-[#14532D]">
                {rider.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-bold">{rider.name}</p>
                <p className="text-xs text-stone-400">{rider.vehicle}</p>
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
              <Navigation size={13} /> {running && adminStage !== 1 ? "On the way (simulated)" : terminal ? "Trip ended (demo)" : "At hub (demo)"} • near {dest.label.split("(")[0].trim()} area
            </p>
            <button
              disabled
              title="Demo only — no contact service is connected"
              className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-stone-200 py-2.5 text-sm font-bold text-stone-300"
            >
              <Phone size={15} /> Contact Rider (demo — unavailable)
            </button>
          </div>

          {/* destination */}
          <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-100">
            <h3 className="flex items-center gap-2 text-sm font-extrabold"><MapPin size={16} className="text-[#16A34A]" /> Delivering to</h3>
            <p className="mt-2 text-[13px] text-stone-500">
              {order.address.name}, {order.address.flat}, {order.address.street}, {order.address.city} {order.address.pin}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Map pin is illustrative sample data, not your geocoded address.</p>
            <h3 className="mt-4 flex items-center gap-2 text-sm font-extrabold"><ShoppingBag size={16} className="text-[#16A34A]" /> Payment</h3>
            <p className="mt-1 text-[13px] text-stone-500">{order.payment} (demo)</p>
          </div>

          <Link to={`/orders/${order.ref}`} className="rounded-full border border-green-200 bg-white py-3 text-center text-sm font-bold text-[#14532D] hover:bg-green-50">
            View Full Order Details
          </Link>
        </aside>
      </div>
    </div>
  );
}
