import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { OilBottle, SnackPack, SpiceJar } from "./FloatingProduce";
import { CustomerA, CustomerC, DeliveryPartner, KiranaBag, Scooter, Shopkeeper } from "./DeliveryCharacters";
import { prefersReducedMotion } from "../../hooks/useGsap";

// ---------------------------------------------------------------------------
// FreshCart delivery story: one connected diorama (Home A — Store — Home B)
// with an 8-stage looping timeline. Purely presentational: no app state,
// no orders, no cart access. Deterministic poses from (stage, localT).
// ---------------------------------------------------------------------------

const DURATIONS = [5, 5, 4, 8, 5, 4, 5, 2];
const TOTAL = DURATIONS.reduce((a, b) => a + b, 0);
const STARTS = DURATIONS.reduce((acc, d, i) => [...acc, i === 0 ? 0 : acc[i - 1] + DURATIONS[i - 1]], []);

const HOME_A_X = -9;
const STORE_X = 0;
const HOME_B_X = 9;
const DOOR_A_X = -6.6;

const easeInOut = (t) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
const lerp = (a, b, t) => a + (b - a) * t;

function stageAt(t) {
  for (let i = 0; i < DURATIONS.length; i++) {
    if (t < STARTS[i] + DURATIONS[i]) return { idx: i, local: (t - STARTS[i]) / DURATIONS[i] };
  }
  return { idx: DURATIONS.length - 1, local: 1 };
}

// --- static environment pieces ---------------------------------------------

function Ground() {
  return (
    <group>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[30, 0.2, 11]} />
        <meshStandardMaterial color="#e9e2d2" roughness={1} />
      </mesh>
      <mesh position={[0, 0.01, 2.6]}>
        <boxGeometry args={[30, 0.02, 1.6]} />
        <meshStandardMaterial color="#a8a29e" roughness={1} />
      </mesh>
      {[-12, -6, 0, 6, 12].map((x) => (
        <mesh key={x} position={[x, 0.025, 2.6]}>
          <boxGeometry args={[1.2, 0.02, 0.12]} />
          <meshStandardMaterial color="#fafaf5" roughness={1} />
        </mesh>
      ))}
      {[[-13, -3.4], [13.5, -3.2], [-4, 4.2], [5, -3.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.15, z]}>
          <coneGeometry args={[0.35, 0.5, 8]} />
          <meshStandardMaterial color="#65a30d" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function HomeA({ doorRef }) {
  return (
    <group position={[HOME_A_X, 0, -1.5]}>
      <mesh position={[0, 0.05, 0]}><boxGeometry args={[5.4, 0.1, 4.6]} /><meshStandardMaterial color="#d6c9ae" roughness={1} /></mesh>
      <mesh position={[-1.2, 1.5, -2.2]}><boxGeometry args={[3, 3, 0.25]} /><meshStandardMaterial color="#faf6ec" roughness={0.9} /></mesh>
      <mesh position={[1.4, 1.5, -2.2]}><boxGeometry args={[2.4, 3, 0.25]} /><meshStandardMaterial color="#f3e7cd" roughness={0.9} /></mesh>
      <mesh position={[-1.2, 1.8, -2.05]}><boxGeometry args={[1.2, 0.9, 0.1]} /><meshStandardMaterial color="#bae6fd" roughness={0.2} /></mesh>
      <mesh position={[2.4, 1.1, -2.1]}><boxGeometry args={[1.1, 2.2, 0.18]} /><meshStandardMaterial color="#8a5a28" roughness={0.8} /></mesh>
      <group ref={doorRef} position={[1.95, 0, -2.0]}>
        <mesh position={[0.45, 1.05, 0]}><boxGeometry args={[0.9, 2.1, 0.1]} /><meshStandardMaterial color="#b07a3f" roughness={0.8} /></mesh>
      </group>
      <mesh position={[-1.6, 0.45, -0.6]}><boxGeometry args={[1.6, 0.5, 0.8]} /><meshStandardMaterial color="#f97316" roughness={0.8} /></mesh>
      <mesh position={[-1.6, 0.85, -0.95]}><boxGeometry args={[1.6, 0.6, 0.25]} /><meshStandardMaterial color="#c2410c" roughness={0.8} /></mesh>
      <mesh position={[-0.2, 0.3, -0.4]}><boxGeometry args={[0.7, 0.5, 0.7]} /><meshStandardMaterial color="#8a5a28" roughness={0.85} /></mesh>
    </group>
  );
}

function Store() {
  return (
    <group position={[STORE_X, 0, -1.5]}>
      <mesh position={[0, 0.05, 0]}><boxGeometry args={[6.4, 0.1, 5]} /><meshStandardMaterial color="#d6c9ae" roughness={1} /></mesh>
      <mesh position={[0, 1.6, -2.4]}><boxGeometry args={[6, 3.2, 0.3]} /><meshStandardMaterial color="#faf6ec" roughness={0.9} /></mesh>
      <mesh position={[0, 2.9, -1.9]} rotation={[0.25, 0, 0]}><boxGeometry args={[6.2, 0.12, 1.2]} /><meshStandardMaterial color="#16A34A" roughness={0.7} /></mesh>
      <mesh position={[0, 3.5, -2.25]}><boxGeometry args={[3.4, 0.7, 0.15]} /><meshStandardMaterial color="#14532D" roughness={0.6} /></mesh>
      <mesh position={[0, 3.5, -2.16]}><boxGeometry args={[3.0, 0.18, 0.05]} /><meshStandardMaterial color="#fafaf5" roughness={0.6} /></mesh>
      {[-1.8, 1.8].map((x) => (
        <group key={x} position={[x, 0, -1.2]}>
          <mesh position={[0, 0.9, 0]}><boxGeometry args={[1.8, 0.08, 0.7]} /><meshStandardMaterial color="#8a5a28" roughness={0.85} /></mesh>
          <mesh position={[0, 1.5, 0]}><boxGeometry args={[1.8, 0.08, 0.7]} /><meshStandardMaterial color="#8a5a28" roughness={0.85} /></mesh>
          {[-0.85, 0.85].map((lx) => (
            <mesh key={lx} position={[lx, 0.45, 0]}><boxGeometry args={[0.08, 0.9, 0.6]} /><meshStandardMaterial color="#8a5a28" roughness={0.85} /></mesh>
          ))}
        </group>
      ))}
      <group scale={0.42}>
        <SpiceJar position={[-4.6, 2.6, -2.4]} />
        <SnackPack position={[-3.4, 2.4, -2.4]} />
        <SpiceJar position={[3.6, 2.6, -2.4]} color="#b45309" />
        <OilBottle position={[4.6, 2.0, -2.4]} />
      </group>
      <mesh position={[0, 0.55, 0.6]}><boxGeometry args={[2.4, 1.0, 0.8]} /><meshStandardMaterial color="#14532D" roughness={0.7} /></mesh>
      <mesh position={[0, 1.08, 0.6]}><boxGeometry args={[2.5, 0.08, 0.9]} /><meshStandardMaterial color="#f3e7cd" roughness={0.8} /></mesh>
    </group>
  );
}

function HomeB() {
  return (
    <group position={[HOME_B_X, 0, -1.5]}>
      <mesh position={[0, 0.05, 0]}><boxGeometry args={[5, 0.1, 4.4]} /><meshStandardMaterial color="#d6c9ae" roughness={1} /></mesh>
      <mesh position={[0, 1.5, -2.2]}><boxGeometry args={[5, 3, 0.25]} /><meshStandardMaterial color="#f3e7cd" roughness={0.9} /></mesh>
      <mesh position={[-0.5, 1.1, -2.05]}><boxGeometry args={[1.1, 2.2, 0.18]} /><meshStandardMaterial color="#7c3aed" roughness={0.8} /></mesh>
      <mesh position={[1.4, 1.9, -2.05]}><boxGeometry args={[1.1, 0.9, 0.1]} /><meshStandardMaterial color="#bae6fd" roughness={0.2} /></mesh>
      <mesh position={[-2.6, 0.35, 0.6]}><boxGeometry args={[0.9, 0.7, 0.9]} /><meshStandardMaterial color="#65a30d" roughness={0.9} /></mesh>
    </group>
  );
}

function CheckPop({ position, innerRef }) {
  return (
    <group ref={innerRef} position={position} scale={0.001}>
      <mesh><sphereGeometry args={[0.32, 18, 14]} /><meshStandardMaterial color="#16A34A" roughness={0.4} /></mesh>
      <mesh position={[-0.06, 0, 0.28]} rotation={[0, 0, 0.7]}><boxGeometry args={[0.09, 0.22, 0.06]} /><meshStandardMaterial color="#fff" /></mesh>
      <mesh position={[0.09, 0.05, 0.28]} rotation={[0, 0, -0.7]}><boxGeometry args={[0.09, 0.34, 0.06]} /><meshStandardMaterial color="#fff" /></mesh>
    </group>
  );
}

function Confetti({ innerRef }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 7;
      arr[i * 3 + 1] = Math.random() * 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);
  const seeds = useMemo(() => {
    const arr = new Float32Array(90);
    for (let i = 0; i < 90; i++) arr[i] = Math.random() * 10;
    return arr;
  }, []);
  useFrame(({ clock }) => {
    const g = innerRef.current;
    if (!g || !g.visible) return;
    const t = clock.getElapsedTime();
    const pos = g.children[0].geometry.attributes.position;
    for (let i = 0; i < 90; i++) {
      pos.array[i * 3 + 1] = 3.5 - ((t * 0.9 + seeds[i]) % 4);
    }
    pos.needsUpdate = true;
  });
  return (
    <group ref={innerRef} visible={false}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.14} color="#f97316" sizeAttenuation />
      </points>
    </group>
  );
}

// Stage-driven badges + confetti, toggled imperatively (no React churn).
function DynamicFx({ controller }) {
  const popA = useRef(null);
  const popC = useRef(null);
  const confetti = useRef(null);
  useFrame(({ clock }) => {
    const t = controller.t ?? 0;
    const { idx, local } = stageAt(t);
    const showA = idx === 0 && local < 0.7;
    const showC = idx === 6 && local < 0.7;
    const party = idx === 5 || showA || showC;
    const pairs = [[popA.current, showA], [popC.current, showC]];
    for (let i = 0; i < pairs.length; i++) {
      const g = pairs[i][0];
      const show = pairs[i][1];
      if (!g) continue;
      const s = THREE.MathUtils.damp(g.scale.x, show ? 1 : 0, 8, 0.03);
      g.scale.setScalar(Math.max(0.001, s));
      g.rotation.y = clock.getElapsedTime() * 1.2;
    }
    if (confetti.current) confetti.current.visible = party;
  });
  return (
    <group>
      <CheckPop innerRef={popA} position={[HOME_A_X - 1.1, 3.2, 0.4]} />
      <CheckPop innerRef={popC} position={[HOME_B_X - 0.4, 3.2, 0.6]} />
      <Confetti innerRef={confetti} />
    </group>
  );
}

// --- the animated rig -------------------------------------------------------

function Rig({ controller, frozenT }) {
  const custA = useRef(null);
  const partner = useRef(null);
  const custC = useRef(null);
  const keeper = useRef(null);
  const ride = useRef(null);
  const wheelF = useRef(null);
  const wheelB = useRef(null);
  const door = useRef(null);
  const bag = useRef(null);
  const bag2 = useRef(null);
  const packFly = useRef(null);
  const lastReport = useRef({ idx: -1, bucket: -1 });
  const tRef = useRef(frozenT ?? 0);
  const { camera, size } = useThree();

  const camGoal = useRef({ pos: new THREE.Vector3(-9, 3.4, 10.5), look: new THREE.Vector3(-9, 1.2, 0) });
  const camPos = useRef(new THREE.Vector3(-9, 3.4, 10.5));
  const camLook = useRef(new THREE.Vector3(-9, 1.2, 0));

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (controller.seekTo >= 0) {
      tRef.current = STARTS[controller.seekTo] + 0.01;
      controller.seekTo = -1;
    }
    if (controller.playing && frozenT == null) {
      tRef.current += dt;
      if (tRef.current >= TOTAL) tRef.current -= TOTAL;
    }
    const t = tRef.current;
    const { idx, local } = stageAt(t);
    controller.t = t;
    controller.stage = idx;
    if (controller.wave > 0 && frozenT == null) controller.wave = Math.max(0, controller.wave - dt);

    const bucket = Math.floor((t / TOTAL) * 20);
    if (lastReport.current.idx !== idx || lastReport.current.bucket !== bucket) {
      lastReport.current = { idx, bucket };
      if (controller.onTick) controller.onTick(idx, t / TOTAL);
    }

    const e = easeInOut(local);
    const smallScreen = size.width / Math.max(1, size.height) < 1;
    const A = custA.current, P = partner.current, C = custC.current, K = keeper.current;
    const time = state.clock.elapsedTime;

    if (A && A.armL.current) {
      if (idx === 0) {
        A.armL.current.rotation.x = -1.0 + Math.sin(time * 6) * 0.12;
        A.head.current.rotation.x = 0.18;
        A.body.current.position.y = 0;
        A.armR.current.rotation.z = 0;
      } else if (idx === 5) {
        A.body.current.position.y = Math.abs(Math.sin(time * 6)) * 0.28;
        A.armL.current.rotation.z = 2.5;
        A.armR.current.rotation.z = -2.5;
        A.armL.current.rotation.x = 0;
        A.head.current.rotation.x = -0.08;
      } else if (idx >= 3) {
        A.armL.current.rotation.x = -0.4;
        A.armR.current.rotation.z = 0;
        A.body.current.position.y = 0;
        A.head.current.rotation.x = 0;
      } else {
        A.armL.current.rotation.x = -0.15;
        A.armR.current.rotation.z = 0;
        A.body.current.position.y = 0;
      }
    }
    if (K && K.armR.current) {
      K.body.current.position.y = idx === 1 ? Math.abs(Math.sin(time * 5)) * 0.12 : 0;
      K.armR.current.rotation.x = idx === 1 ? -1.1 + Math.sin(time * 5) * 0.3 : -0.15;
    }
    if (P && P.armR.current) {
      const celebrating = idx === 5;
      if (celebrating || controller.wave > 0) {
        P.armR.current.rotation.z = -2.4 + Math.sin(time * 9) * 0.35;
        P.body.current.position.y = celebrating ? Math.abs(Math.sin(time * 6)) * 0.22 : 0;
      } else {
        P.armR.current.rotation.z *= 0.9;
        P.body.current.position.y *= 0.9;
      }
      P.head.current.rotation.y = Math.sin(time * 0.8) * 0.12;
    }
    if (C && C.armL.current) {
      if (idx === 6) {
        C.armL.current.rotation.x = -1.0 + Math.sin(time * 6) * 0.12;
        C.head.current.rotation.x = 0.18;
        C.body.current.position.y = Math.abs(Math.sin(time * 3)) * 0.08;
      } else {
        C.armL.current.rotation.x = -0.15;
        C.head.current.rotation.x = 0;
        C.body.current.position.y = 0;
      }
    }

    const rideX = (() => {
      if (idx < 3) return lerp(-3.5, -1.2, idx === 2 ? e : 0);
      if (idx === 3) return lerp(-1.2, DOOR_A_X + 1.2, e);
      if (idx <= 5) return DOOR_A_X + 1.2;
      return lerp(DOOR_A_X + 1.2, -3.0, idx === 6 ? e * 0.6 : 0);
    })();
    if (ride.current) {
      ride.current.position.set(rideX, 0, 2.6);
      ride.current.rotation.y = idx >= 6 ? Math.PI * 0.08 : -Math.PI * 0.06;
      const moving = idx === 3 || (idx === 6 && local > 0.5);
      if (moving) {
        ride.current.position.y = Math.abs(Math.sin(time * 10)) * 0.05;
        if (wheelF.current) wheelF.current.rotation.z -= dt * 9;
        if (wheelB.current) wheelB.current.rotation.z -= dt * 9;
        if (P && P.body.current) P.body.current.position.y = Math.abs(Math.sin(time * 10)) * 0.06;
      } else {
        ride.current.position.y *= 0.9;
      }
    }

    if (door.current) {
      const target = idx === 4 || idx === 5 ? -1.9 : 0;
      door.current.rotation.y += (target - door.current.rotation.y) * Math.min(1, dt * 4);
    }

    if (packFly.current) {
      const vis = idx === 1;
      packFly.current.visible = vis;
      if (vis) {
        const k = (local * 3) % 1;
        packFly.current.position.set(lerp(-1.2, 0, k), lerp(2.2, 1.5, k), lerp(-2.2, -0.9, k));
      }
    }

    if (bag.current) {
      let bx = 0, by = 1.5, bz = -0.9, s = 1;
      if (idx <= 1) { bx = 0; by = 1.5; bz = -0.9; }
      else if (idx === 2) { const k = e; bx = lerp(0, -1.0, k); by = lerp(1.5, 1.1, k); bz = lerp(-0.9, 1.6, k); }
      else if (idx === 3) { bx = rideX + 0.5; by = 1.35; bz = 2.6; }
      else if (idx === 4) { const k = e; bx = lerp(rideX + 0.5, DOOR_A_X + 0.4, k); by = lerp(1.35, 1.0, k); bz = lerp(2.6, 0.6, k); }
      else { bx = DOOR_A_X + 0.1; by = 0.75; bz = 0.2; s = 1 + (idx === 5 ? Math.sin(time * 6) * 0.03 : 0); }
      bag.current.position.set(bx, by, bz);
      bag.current.scale.setScalar(s);
    }
    if (bag2.current) {
      const vis = idx >= 6;
      bag2.current.visible = vis;
      if (vis) bag2.current.scale.setScalar(Math.max(0.001, Math.min(1, local * 3)));
    }

    const zBoost = smallScreen ? 1.55 : 1;
    const yBoost = smallScreen ? 1.2 : 0;
    const cams = [
      { p: [-9, 3.4, 10.5], l: [-9, 1.2, 0] },
      { p: [0, 3.6, 11], l: [0, 1.4, 0] },
      { p: [-1.5, 2.8, 8], l: [-0.6, 1.2, 0] },
      { p: [rideX * 0.75, 3.6, 10.5], l: [rideX * 0.75, 1.0, 0.5] },
      { p: [-6.6, 2.8, 7.5], l: [-7.4, 1.2, 0] },
      { p: [-6.8, 3.0, 8.5], l: [-7.2, 1.1, 0] },
      { p: [9, 3.4, 10.5], l: [9, 1.2, 0] },
      { p: [0, 6.5, 19], l: [0, 1, 0] },
    ];
    const c = cams[idx];
    camGoal.current.pos.set(c.p[0], c.p[1] + yBoost, c.p[2] * zBoost);
    camGoal.current.look.set(c.l[0], c.l[1], c.l[2]);
    const k2 = 1 - Math.exp(-2.6 * dt);
    camPos.current.lerp(camGoal.current.pos, k2);
    camLook.current.lerp(camGoal.current.look, k2);
    camera.position.copy(camPos.current);
    camera.lookAt(camLook.current);
  });

  return (
    <group>
      <Ground />
      <HomeA doorRef={door} />
      <Store />
      <HomeB />
      <CustomerA ref={(n) => { custA.current = n; }} position={[HOME_A_X - 1.1, 0.1, 0.4]} rotationY={0.5} mood="happy" />
      <Shopkeeper ref={(n) => { keeper.current = n; }} position={[0.1, 0.1, -0.5]} rotationY={Math.PI} />
      <group ref={ride} position={[-3.5, 0, 2.6]}>
        <Scooter wheelRefs={{ wheelF, wheelB }} />
        <DeliveryPartner ref={(n) => { partner.current = n; }} position={[0.1, 0.62, 0]} rotationY={-Math.PI / 2} />
      </group>
      <CustomerC ref={(n) => { custC.current = n; }} position={[HOME_B_X - 0.4, 0.1, 0.6]} rotationY={-0.4} mood="happy" />
      <group ref={bag}><KiranaBag /></group>
      <group ref={bag2} visible={false}><KiranaBag scale={0.9} /></group>
      <group ref={packFly} visible={false}>
        <SpiceJar color="#b45309" />
      </group>
      <DynamicFx controller={controller} />
    </group>
  );
}

export function DeliveryStoryCanvas({ controller, frozen = false, paused = false }) {
  const still = prefersReducedMotion();
  const frozenFrame = frozen || still;
  const active = !frozenFrame && !paused && controller.playing !== false;
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [-9, 3.4, 10.5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={active ? "always" : "never"}
      role="img"
      aria-label="3D animated story: customer orders kirana groceries, store packs them, delivery partner delivers, both celebrate, next customer orders"
    >
      <hemisphereLight args={["#eafaf0", "#d9cfae", 0.95]} />
      <directionalLight position={[6, 9, 6]} intensity={1.2} color="#fff5e0" />
      <directionalLight position={[-6, 4, 4]} intensity={0.4} color="#bbf7d0" />
      <Rig controller={controller} frozenT={frozenFrame ? 1.2 : null} />
      <ContactShadows position={[0, 0.02, -0.5]} opacity={0.4} scale={30} blur={2.4} far={4} color="#14532d" />
    </Canvas>
  );
}

export const STORY_TOTAL = TOTAL;
