import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { prefersReducedMotion } from "../hooks/useGsap";

// Gentle pointer-driven 3D tilt for product imagery (Motion only — no extra
// WebGL scenes). Disabled for reduced-motion users and touch pointers so
// shopping interactions stay untouched.
export default function TiltImage({ children, max = 7, className = "" }) {
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 180, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 180, damping: 20 });

  const onMove = (e) => {
    if (prefersReducedMotion()) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: 900, rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
