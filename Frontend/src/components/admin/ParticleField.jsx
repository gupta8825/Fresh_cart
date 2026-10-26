import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../../hooks/useGsap";

// Decorative particle field (raw three.js, single canvas, no R3F overhead).
// Pointer-events-none, sits behind content. Pauses when hidden/reduced-motion.
// Falls back to a CSS gradient when WebGL is unavailable.
export default function ParticleField({ density = 70, className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer = null;
    let raf = 0;
    let disposed = false;
    let scene = null;
    let camera = null;
    let points = null;
    let lines = null;
    let velocities = null;
    let THREE = null;

    const onResize = () => {
      if (!renderer || !camera || !host) return;
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const tick = () => {
      if (disposed) return;
      if (document.hidden) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const pos = points.geometry.attributes.position;
      const arr = pos.array;
      const n = velocities.length / 3;
      for (let i = 0; i < n; i++) {
        arr[i * 3] += velocities[i * 3];
        arr[i * 3 + 1] += velocities[i * 3 + 1];
        arr[i * 3 + 2] += velocities[i * 3 + 2];
        if (arr[i * 3] > 14 || arr[i * 3] < -14) velocities[i * 3] *= -1;
        if (arr[i * 3 + 1] > 8 || arr[i * 3 + 1] < -8) velocities[i * 3 + 1] *= -1;
      }
      pos.needsUpdate = true;
      // Rebuild connecting lines for nearby particles (capped count).
      const lp = lines.geometry.attributes.position;
      let li = 0;
      const maxSeg = Math.floor(lp.array.length / 6);
      outer: for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = arr[i * 3] - arr[j * 3];
          const dy = arr[i * 3 + 1] - arr[j * 3 + 1];
          if (dx * dx + dy * dy < 7.5) {
            lp.array[li++] = arr[i * 3];
            lp.array[li++] = arr[i * 3 + 1];
            lp.array[li++] = 0;
            lp.array[li++] = arr[j * 3];
            lp.array[li++] = arr[j * 3 + 1];
            lp.array[li++] = 0;
            if (li / 6 >= maxSeg) break outer;
          }
        }
      }
      lines.geometry.setDrawRange(0, li / 3);
      lp.needsUpdate = true;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    (async () => {
      try {
        if (prefersReducedMotion()) return; // CSS fallback stays visible
        THREE = await import("three");
        if (disposed || !host) return;
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
        host.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.z = 14;
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? Math.floor(density / 2) : density;
        const positions = new Float32Array(count * 3);
        velocities = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 28;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
          positions[i * 3 + 2] = 0;
          velocities[i * 3] = (Math.random() - 0.5) * 0.008;
          velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.006;
          velocities[i * 3 + 2] = 0;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({ color: 0x5eead4, size: 0.09, transparent: true, opacity: 0.55 });
        points = new THREE.Points(geo, mat);
        scene.add(points);
        const maxSeg = isMobile ? 60 : 140;
        const lgeo = new THREE.BufferGeometry();
        lgeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(maxSeg * 6), 3));
        lines = new THREE.LineSegments(
          lgeo,
          new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.22 })
        );
        scene.add(lines);
        window.addEventListener("resize", onResize);
        onResize();
        raf = requestAnimationFrame(tick);
      } catch {
        // WebGL unavailable — CSS gradient fallback remains.
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      try {
        scene?.traverse((o) => {
          o.geometry?.dispose?.();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.());
          else o.material?.dispose?.();
        });
        renderer?.dispose?.();
        if (renderer?.domElement?.parentNode === host) host.removeChild(renderer.domElement);
      } catch { /* ignore */ }
      scene = camera = points = lines = null;
    };
  }, [density]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(1200px_600px_at_20%_-10%,#123a6b_0%,transparent_60%),radial-gradient(1000px_500px_at_90%_10%,#3b1d5e_0%,transparent_55%),linear-gradient(180deg,#0a1830_0%,#0d2242_100%)] ${className}`}
    />
  );
}
