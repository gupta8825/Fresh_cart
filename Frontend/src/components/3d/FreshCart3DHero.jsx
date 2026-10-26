import { Canvas } from "@react-three/fiber";
import { ContactShadows, Sparkles } from "@react-three/drei";
import { PackageRing } from "./FloatingProduce";
import { prefersReducedMotion } from "../../hooks/useGsap";

// Premium studio-style hero scene: soft green lighting, floating kirana
// packs, contact shadows. Transparent background over a CSS gradient.
export default function FreshCart3DHero() {
  const still = prefersReducedMotion();
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.5, 8.4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden={false}
      role="img"
      aria-label="3D scene of kirana grocery packs, jars and a shopping basket"
    >
      <hemisphereLight args={["#eafaf0", "#d9cfae", 0.9]} />
      <directionalLight position={[5, 6, 4]} intensity={1.15} color="#fff5e0" />
      <directionalLight position={[-5, 2, 3]} intensity={0.4} color="#bbf7d0" />
      <directionalLight position={[0, 3, -5]} intensity={0.35} color="#ffffff" />
      <PackageRing spin={!still} />
      {!still && <Sparkles count={28} scale={[7, 4, 3]} size={2.5} speed={0.25} color="#86efac" opacity={0.6} />}
      <ContactShadows position={[0, -2.35, 0]} opacity={0.42} scale={11} blur={2.6} far={3} color="#14532d" />
    </Canvas>
  );
}
