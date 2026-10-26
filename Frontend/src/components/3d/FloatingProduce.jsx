import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Stylized kirana packaging built from composed Three.js geometry
// (labelled packs, sacks, jars, bottles) — no external model files.

function LabelBand({ y = 0, w = 1.34, h = 0.5, d = 0.94, color = "#16A34A" }) {
  return (
    <mesh position={[0, y, 0]}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
}

export function AttaBag({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.3, 1.6, 0.9]} />
        <meshStandardMaterial color="#f3e7cd" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.86, 0]} rotation={[0, 0, 0.06]}>
        <boxGeometry args={[1.34, 0.16, 0.94]} />
        <meshStandardMaterial color="#e0cfa8" roughness={0.85} />
      </mesh>
      <LabelBand y={0.1} color="#16A34A" />
      <mesh position={[0, 0.1, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 24]} />
        <meshStandardMaterial color="#f97316" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[1.32, 0.22, 0.92]} />
        <meshStandardMaterial color="#14532D" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function RiceSack({ position }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.95, 1.05, 1.5, 24]} />
        <meshStandardMaterial color="#c9a06a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.42, 0.7, 0.45, 20]} />
        <meshStandardMaterial color="#b08a52" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.09, 10, 24]} />
        <meshStandardMaterial color="#7c5225" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.5, 24]} />
        <meshStandardMaterial color="#14532D" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function SpiceJar({ position, color = "#c2410c" }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.95, 24]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.4, 24]} />
        <meshStandardMaterial color="#faf6ec" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.3, 24]} />
        <meshStandardMaterial color="#14532D" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function OilBottle({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.1, 24]} />
        <meshPhysicalMaterial color="#eab308" roughness={0.25} clearcoat={0.7} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.5, 0.42, 24]} />
        <meshPhysicalMaterial color="#eab308" roughness={0.25} clearcoat={0.7} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.28, 16]} />
        <meshStandardMaterial color="#14532D" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.45, 24]} />
        <meshStandardMaterial color="#faf6ec" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function SnackPack({ position, color = "#f97316" }) {
  return (
    <group position={position} rotation={[0, 0.35, 0]}>
      <mesh>
        <boxGeometry args={[1.0, 1.25, 0.42]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[1.02, 0.12, 0.44]} />
        <meshStandardMaterial color="#9a3412" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.1, 0.22]}>
        <boxGeometry args={[0.8, 0.55, 0.02]} />
        <meshStandardMaterial color="#fff7ed" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.45, 0.22]}>
        <boxGeometry args={[0.8, 0.16, 0.02]} />
        <meshStandardMaterial color="#14532D" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function Basket({ position = [0, -1.7, 0] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[1.5, 1.05, 0.9, 28, 1, true]} />
        <meshStandardMaterial color="#b07a3f" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.09, 12, 40]} />
        <meshStandardMaterial color="#8a5a28" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.06, 28]} />
        <meshStandardMaterial color="#7c5225" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Slowly rotating kirana shelf ring. `spin` disables motion for reduced-motion.
export function PackageRing({ spin = true }) {
  const group = useRef(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    if (spin) {
      group.current.rotation.y += delta * 0.18;
      // gentle pointer parallax (does not touch React state)
      const { x, y } = state.pointer;
      group.current.rotation.x += ((y * 0.12) - group.current.rotation.x) * 0.04;
      group.current.rotation.z += ((x * 0.05) - group.current.rotation.z) * 0.04;
    }
  });
  const floatProps = spin ? { speed: 1.6, floatIntensity: 0.9, rotationIntensity: 0.25 } : { speed: 0, floatIntensity: 0, rotationIntensity: 0 };
  return (
    <group ref={group}>
      <Float {...floatProps} floatingRange={[-0.15, 0.15]}><AttaBag position={[-2.2, 0.3, 0]} /></Float>
      <Float {...floatProps} floatingRange={[-0.2, 0.2]}><RiceSack position={[2.2, 0.1, -0.3]} /></Float>
      <Float {...floatProps} floatingRange={[-0.15, 0.15]}><SpiceJar position={[0.9, 1.7, -0.6]} /></Float>
      <Float {...floatProps} floatingRange={[-0.2, 0.2]}><SpiceJar position={[-0.9, 1.85, -0.8]} color="#b45309" /></Float>
      <Float {...floatProps} floatingRange={[-0.1, 0.1]}><OilBottle position={[0.1, -0.4, 0.9]} /></Float>
      <Float {...floatProps} floatingRange={[-0.15, 0.15]}><SnackPack position={[-1.3, -1.0, 0.9]} /></Float>
      <Basket />
    </group>
  );
}
