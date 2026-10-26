import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, RotateCcw, ShoppingBag, PackageCheck, Bike, PartyPopper } from "lucide-react";
import { STAGES } from "./3d/storyStages";
import { SceneFallback, isWebGLAvailable } from "./3d/SceneLoader";
import { prefersReducedMotion } from "../hooks/useGsap";

const DeliveryStoryCanvas = lazy(() =>
  import("./3d/DeliveryStoryScene").then((m) => ({ default: m.DeliveryStoryCanvas }))
);

const STEPS = [
  { icon: ShoppingBag, title: "Order Online", text: "Tap, pick kirana staples, check out." },
  { icon: PackageCheck, title: "We Pack Your Essentials", text: "Atta, dal, spices bagged with care." },
  { icon: Bike, title: "Fast Delivery", text: "Your partner rides straight over." },
  { icon: PartyPopper, title: "Happy Customers", text: "Doorstep handover, smiles guaranteed." },
];

export default function DeliveryStorySection() {
  const wrapRef = useRef(null);
  const controller = useMemo(
    () => ({ playing: true, seekTo: -1, wave: 0, t: 0, stage: 0, onTick: null }),
    []
  );
  const [playing, setPlaying] = useState(true);
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [webgl] = useState(() => {
    try {
      return isWebGLAvailable();
    } catch {
      return false;
    }
  });
  const reduced = useMemo(() => {
    try {
      return prefersReducedMotion();
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    controller.playing = playing;
  }, [controller, playing]);

  useEffect(() => {
    controller.onTick = (idx, p) => {
      setStageIdx(idx);
      setProgress(p);
    };
    return () => {
      controller.onTick = null;
    };
  }, [controller]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.05,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const toggle = () => setPlaying((p) => !p);
  const replay = () => {
    controller.seekTo = 0;
    setPlaying(true);
  };
  const wave = () => {
    controller.wave = 1.6;
  };

  const stage = STAGES[stageIdx] || STAGES[0];
  const showScene = webgl && !reduced;

  return (
    <section ref={wrapRef} id="how-it-works" className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">How FreshCart Works</p>
        <h2 className="mt-1 text-2xl font-extrabold text-stone-900 sm:text-3xl">From Your Order to Your Doorstep</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-stone-500">
          Watch a kirana order travel from phone tap to happy doorstep — a looping 3D demo. No real orders are created.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-100 via-[#FAFAF5] to-orange-100 shadow-2xl shadow-green-100 ring-1 ring-green-100">
        {showScene ? (
          <div className="relative">
            <div className="h-[360px] w-full sm:h-[440px] lg:h-[520px]">
              <Suspense fallback={<SceneFallback label="Loading delivery story…" />}>
                <DeliveryStoryCanvas controller={controller} paused={!visible || !playing} />
              </Suspense>
            </div>
            {/* status overlay */}
            <div className="pointer-events-none absolute left-3 top-3 max-w-[75%] rounded-2xl bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur sm:left-5 sm:top-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A]">
                Stage {stageIdx + 1} of {STAGES.length}
              </p>
              <p className="text-sm font-extrabold text-stone-900">{stage.label}</p>
              <p className="text-xs text-stone-500">{stage.sub}</p>
            </div>
            {/* controls */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2 sm:bottom-5 sm:left-5 sm:right-5">
              <div className="flex gap-2">
                <button
                  onClick={toggle}
                  aria-label={playing ? "Pause story" : "Play story"}
                  className="rounded-full bg-white/95 p-2.5 text-[#14532D] shadow-xl backdrop-blur hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
                >
                  {playing ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                  onClick={replay}
                  aria-label="Replay story"
                  className="rounded-full bg-white/95 p-2.5 text-[#14532D] shadow-xl backdrop-blur hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/60">
                  <div className="h-full rounded-full bg-[#16A34A] transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  {STAGES.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        controller.seekTo = i;
                        setPlaying(true);
                      }}
                      aria-label={`Jump to stage: ${s.label}`}
                      title={s.label}
                      className={`h-2 flex-1 rounded-full transition ${i <= stageIdx ? "bg-[#16A34A]" : "bg-white/70"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="text-5xl" aria-hidden="true">🛵</span>
            <p className="max-w-md text-sm font-semibold text-stone-700">
              {reduced
                ? "Simplified view (reduced motion on): order → pack → deliver → celebrate → repeat."
                : "3D is unavailable in this browser — the story still works the same way:"}
            </p>
            <ol className="flex flex-wrap justify-center gap-2">
              {STAGES.map((s, i) => (
                <li key={s.id} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#14532D] shadow">
                  {i + 1}. {s.label}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            onMouseEnter={i === 2 ? wave : undefined}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100 transition-shadow hover:shadow-xl hover:shadow-green-100"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-[#16A34A]">
              <s.icon size={20} />
            </span>
            <p className="mt-3 text-sm font-extrabold text-stone-900">
              {i + 1}. {s.title}
            </p>
            <p className="mt-1 text-[13px] text-stone-500">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/shop"
          onMouseEnter={wave}
          className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-[#14532D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
        >
          <ShoppingBag size={17} /> Start Your Own Order
        </Link>
        <p className="mt-2 text-[11px] text-stone-400">Visual story only — this animation never touches your cart or orders.</p>
      </div>
    </section>
  );
}
