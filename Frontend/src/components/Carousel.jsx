import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prefersReducedMotion } from "../hooks/useGsap";

// Reusable accessible carousel built on native horizontal scrolling +
// CSS scroll snapping (no extra dependency). No looping (avoids duplicate
// slides); arrows clamp at the ends. Autoplay pauses while the user
// interacts, when the tab is hidden, or when reduced motion is requested.
export default function Carousel({
  items = [],
  renderSlide,
  slideClassName = "w-full shrink-0 snap-start",
  ariaLabel = "Carousel",
  prevLabel = "Previous slide",
  nextLabel = "Next slide",
  dotLabel = (i) => `Go to slide ${i + 1}`,
  autoplay = false,
  autoplayMs = 6000,
  showArrows = true,
  showDots = true,
  arrowsClassName = "",
}) {
  const trackRef = useRef(null);
  const idleTimer = useRef(null);
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const reduced = prefersReducedMotion();

  const slideStep = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return track?.clientWidth || 0;
    // Distance between consecutive slide starts (includes the flex gap).
    return Math.abs(track.children[1].offsetLeft - track.children[0].offsetLeft) || track.clientWidth;
  }, []);

  const syncFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = slideStep();
    const i = step > 0 ? Math.round(track.scrollLeft / step) : 0;
    setIndex(Math.max(0, Math.min(items.length - 1, i)));
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft < track.scrollWidth - track.clientWidth - 4);
  }, [items.length, slideStep]);

  useEffect(() => {
    syncFromScroll();
  }, [syncFromScroll, items.length]);

  const goTo = useCallback(
    (i) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(items.length - 1, i));
      track.scrollTo({ left: clamped * slideStep(), behavior: reduced ? "auto" : "smooth" });
    },
    [items.length, slideStep, reduced]
  );

  const poke = useCallback(() => {
    // Any interaction pauses autoplay; resume after 8s of idle time.
    setInteracting(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setInteracting(false), 8000);
  }, []);

  // Autoplay: advances one slide, wraps to the start. Skipped entirely for
  // reduced motion; paused while interacting or when the tab is hidden.
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = interacting;
  }, [interacting]);
  useEffect(() => {
    if (!autoplay || reduced || items.length < 2) return;
    const id = setInterval(() => {
      if (document.hidden || pausedRef.current) return;
      const track = trackRef.current;
      if (!track) return;
      goTo(index >= items.length - 1 ? 0 : index + 1);
    }, autoplayMs);
    return () => clearInterval(id);
  }, [autoplay, autoplayMs, reduced, items.length, index, goTo]);

  useEffect(() => {
    const onVis = () => {
      // Force a sync when returning to the tab so dots/arrows are correct.
      if (!document.hidden) syncFromScroll();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [syncFromScroll]);

  if (!items.length) return null;

  return (
    <div>
      <div className="relative">
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
          tabIndex={0}
          onScroll={syncFromScroll}
          onPointerDown={poke}
          onFocusCapture={poke}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") goTo(index - 1);
            else if (e.key === "ArrowRight") goTo(index + 1);
          }}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] motion-reduce:scroll-auto"
        >
          {items.map((item, i) => (
            <div
              key={item.id ?? i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
              className={slideClassName}
            >
              {renderSlide(item, i)}
            </div>
          ))}
        </div>
        {showArrows && items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => {
                poke();
                goTo(index - 1);
              }}
              disabled={!canPrev}
              aria-label={prevLabel}
              className={`absolute -left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-2.5 text-[#14532D] shadow-xl ring-1 ring-stone-200 transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] disabled:opacity-30 sm:block md:-left-4 ${arrowsClassName}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                poke();
                goTo(index + 1);
              }}
              disabled={!canNext}
              aria-label={nextLabel}
              className={`absolute -right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-2.5 text-[#14532D] shadow-xl ring-1 ring-stone-200 transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] disabled:opacity-30 sm:block md:-right-4 ${arrowsClassName}`}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      {showDots && items.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5" role="tablist" aria-label={ariaLabel}>
          {items.map((item, i) => (
            <button
              key={item.id ?? i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={dotLabel(i)}
              onClick={() => {
                poke();
                goTo(i);
              }}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-[#16A34A]" : "w-2 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
