import { Suspense } from "react";
import { ShoppingBasket } from "lucide-react";

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SceneFallback({ label = "Loading 3D scene…" }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[2rem] bg-gradient-to-br from-green-50 via-[#FAFAF5] to-orange-50">
      <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-[#16A34A] text-white">
        <ShoppingBasket size={26} />
      </span>
      <p className="text-xs font-semibold text-stone-400">{label}</p>
    </div>
  );
}

export function SceneSuspense({ children, label }) {
  return <Suspense fallback={<SceneFallback label={label} />}>{children}</Suspense>;
}
