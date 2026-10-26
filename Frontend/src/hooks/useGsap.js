import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Run a gsap.context-scoped effect with automatic cleanup + ScrollTrigger safety */
export function useGsapScope(fn, deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(fn, ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export { gsap, ScrollTrigger };
