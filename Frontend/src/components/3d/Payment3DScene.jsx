import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import { OilBottle, SnackPack, SpiceJar } from "./FloatingProduce";
import { prefersReducedMotion } from "../../hooks/useGsap";

function Bag() {
  const ref = useRef(null);
  const still = prefersReducedMotion();
  useFrame(({ clock }) => {
    if (!ref.current || still) return;
    ref.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.12;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1.5, 1.5, 0.9]} />
        <meshStandardMaterial color="#16A34A" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[1.56, 0.12, 0.96]} />
        <meshStandardMaterial color="#14532D" roughness={0.6} />
      </mesh>
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, 1.15, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.28, 0.055, 10, 24, Math.PI]} />
          <meshStandardMaterial color="#14532D" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0.46]}>
        <boxGeometry args={[0.9, 0.5, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
    </group>
  );
}

// Small decorative scene for the payment page. The QR code itself is NEVER
// rendered inside the canvas — it stays flat HTML so it remains scannable.
export default function Payment3DScene() {
  const still = prefersReducedMotion();
  const floatProps = still ? { speed: 0, floatIntensity: 0, rotationIntensity: 0 } : { speed: 1.4, floatIntensity: 0.7, rotationIntensity: 0.3 };
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.4, 6.4], fov: 40 }} gl={{ antialias: true, alpha: true }} aria-hidden="true">
      <hemisphereLight args={["#eafaf0", "#d9cfae", 0.9]} />
      <directionalLight position={[4, 5, 4]} intensity={1.1} color="#fff5e0" />
      <directionalLight position={[-4, 2, 3]} intensity={0.35} color="#bbf7d0" />
      <Float {...floatProps}><Bag /></Float>
      <Float {...floatProps}><SpiceJar position={[-1.9, -0.6, 0]} /></Float>
      <Float {...floatProps}><OilBottle position={[1.9, -0.7, -0.3]} /></Float>
      <Float {...floatProps}><SnackPack position={[1.2, 1.1, -0.8]} /></Float>
      <ContactShadows position={[0, -1.6, 0]} opacity={0.35} scale={9} blur={2.4} far={3} color="#14532d" />
    </Canvas>
  );
}
