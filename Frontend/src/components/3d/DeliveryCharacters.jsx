import { forwardRef, useImperativeHandle, useRef } from "react";

// Stylized low-poly kirana characters from composed geometry:
// capsule-ish limbs, expressive eyes + smiles, hair, clothing, accessories.
// Articulated shoulders/neck allow wave / nod / celebrate poses driven
// per-frame from a `pose` object (no React state churn).

function Eyes({ mood = "happy", color = "#1c1917" }) {
  const s = mood === "excited" ? 0.085 : 0.065;
  return (
    <group>
      <mesh position={[-0.13, 0.08, 0.26]}><sphereGeometry args={[s, 12, 12]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
      <mesh position={[0.13, 0.08, 0.26]}><sphereGeometry args={[s, 12, 12]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
      {/* catchlights */}
      <mesh position={[-0.11, 0.1, 0.31]}><sphereGeometry args={[0.02, 8, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[0.15, 0.1, 0.31]}><sphereGeometry args={[0.02, 8, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
    </group>
  );
}

function Smile({ mood = "happy" }) {
  // torus arc; excited = bigger open smile
  const scale = mood === "excited" ? 1.35 : mood === "sad" ? 0.8 : 1;
  const rot = mood === "sad" ? Math.PI : 0;
  return (
    <mesh position={[0, -0.1, 0.26]} rotation={[0, 0, rot + Math.PI]} scale={scale}>
      <torusGeometry args={[0.1, 0.022, 8, 16, Math.PI]} />
      <meshStandardMaterial color="#7c2d12" roughness={0.5} />
    </mesh>
  );
}

function Hair({ color = "#1c1917", style = "short" }) {
  if (style === "bun") {
    return (
      <group>
        <mesh position={[0, 0.22, -0.03]} scale={[1, 0.75, 1]}><sphereGeometry args={[0.3, 16, 12]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
        <mesh position={[0, 0.48, -0.08]}><sphereGeometry args={[0.12, 12, 10]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      </group>
    );
  }
  if (style === "cap") {
    return (
      <mesh position={[0, 0.24, 0.02]} scale={[1, 0.7, 1]}><sphereGeometry args={[0.3, 16, 12]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
    );
  }
  return (
    <mesh position={[0, 0.2, -0.04]} scale={[1, 0.8, 1]}><sphereGeometry args={[0.3, 16, 12]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
  );
}

function Limb({ position, color, r = 0.11, len = 0.62 }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[r, r * 0.9, len, 12]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

// Generic articulated person. Exposes arm/head/body refs for animation.
const Person = forwardRef(function Person({
  position = [0, 0, 0], rotationY = 0,
  skin = "#c68642", shirt = "#16A34A", pants = "#1e3a8a",
  hairColor = "#1c1917", hairStyle = "short",
  mood = "happy", phone = false, helmet = false, jacketStripe = false,
  bag = false, scale = 1,
}, ref) {
  const armL = useRef(null);
  const armR = useRef(null);
  const head = useRef(null);
  const body = useRef(null);
  useImperativeHandle(ref, () => ({ armL: armL.current, armR: armR.current, head: head.current, body: body.current }));
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <group ref={body}>
        {/* legs */}
        <Limb position={[-0.14, 0.31, 0]} color={pants} />
        <Limb position={[0.14, 0.31, 0]} color={pants} />
        {/* shoes */}
        <mesh position={[-0.14, 0.05, 0.05]}><boxGeometry args={[0.2, 0.1, 0.32]} /><meshStandardMaterial color="#292524" roughness={0.8} /></mesh>
        <mesh position={[0.14, 0.05, 0.05]}><boxGeometry args={[0.2, 0.1, 0.32]} /><meshStandardMaterial color="#292524" roughness={0.8} /></mesh>
        {/* torso */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.26, 0.3, 0.7, 14]} />
          <meshStandardMaterial color={shirt} roughness={0.65} />
        </mesh>
        {jacketStripe && (
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.275, 0.285, 0.16, 14]} />
            <meshStandardMaterial color="#fafaf5" roughness={0.6} />
          </mesh>
        )}
        {/* arms pivoted at shoulders */}
        <group ref={armL} position={[-0.33, 1.22, 0]}>
          <mesh position={[0, -0.28, 0]}><cylinderGeometry args={[0.09, 0.08, 0.6, 10]} /><meshStandardMaterial color={shirt} roughness={0.65} /></mesh>
          <mesh position={[0, -0.6, 0]}><sphereGeometry args={[0.09, 10, 10]} /><meshStandardMaterial color={skin} roughness={0.6} /></mesh>
          {phone && (
            <mesh position={[0, -0.62, 0.12]} rotation={[-0.4, 0, 0]}><boxGeometry args={[0.14, 0.24, 0.03]} /><meshStandardMaterial color="#1c1917" roughness={0.4} /></mesh>
          )}
        </group>
        <group ref={armR} position={[0.33, 1.22, 0]}>
          <mesh position={[0, -0.28, 0]}><cylinderGeometry args={[0.09, 0.08, 0.6, 10]} /><meshStandardMaterial color={shirt} roughness={0.65} /></mesh>
          <mesh position={[0, -0.6, 0]}><sphereGeometry args={[0.09, 10, 10]} /><meshStandardMaterial color={skin} roughness={0.6} /></mesh>
          {bag && (
            <group position={[0, -0.72, 0.05]}>
              <mesh><boxGeometry args={[0.34, 0.4, 0.22]} /><meshStandardMaterial color="#16A34A" roughness={0.6} /></mesh>
              <mesh position={[0, 0.02, 0.12]}><boxGeometry args={[0.2, 0.14, 0.02]} /><meshStandardMaterial color="#fafaf5" roughness={0.5} /></mesh>
            </group>
          )}
        </group>
        {/* head */}
        <group ref={head} position={[0, 1.62, 0]}>
          <mesh><sphereGeometry args={[0.3, 20, 16]} /><meshStandardMaterial color={skin} roughness={0.55} /></mesh>
          <Hair color={hairColor} style={hairStyle} />
          <Eyes mood={mood} />
          <Smile mood={mood} />
          {helmet && (
            <group>
              <mesh position={[0, 0.16, 0]} scale={[1.08, 0.85, 1.08]}><sphereGeometry args={[0.3, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#14532D" roughness={0.35} /></mesh>
              <mesh position={[0, 0.1, 0.28]}><boxGeometry args={[0.34, 0.1, 0.04]} /><meshStandardMaterial color="#0b2818" roughness={0.2} /></mesh>
            </group>
          )}
        </group>
      </group>
    </group>
  );
});

export function CustomerA(props) {
  return <Person skin="#b5651d" shirt="#f97316" pants="#334155" hairColor="#1c1917" hairStyle="short" phone {...props} />;
}

export function DeliveryPartner(props) {
  return <Person skin="#8d5524" shirt="#16A34A" pants="#14532D" hairColor="#1c1917" hairStyle="cap" helmet jacketStripe {...props} />;
}

export function CustomerC(props) {
  return <Person skin="#c68642" shirt="#7c3aed" pants="#44403c" hairColor="#3f2d20" hairStyle="bun" phone {...props} />;
}

export function Shopkeeper(props) {
  return <Person skin="#a16207" shirt="#eab308" pants="#57534e" hairColor="#44403c" hairStyle="short" {...props} />;
}

// Grocery bag with FreshCart-green branding + kirana packs peeking out.
export function KiranaBag({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.7, 0.6, 0.45]} /><meshStandardMaterial color="#16A34A" roughness={0.6} /></mesh>
      <mesh position={[0, 0.32, 0.24]}><boxGeometry args={[0.42, 0.28, 0.02]} /><meshStandardMaterial color="#fafaf5" roughness={0.5} /></mesh>
      <mesh position={[-0.12, 0.68, 0]}><boxGeometry args={[0.24, 0.3, 0.2]} /><meshStandardMaterial color="#f3e7cd" roughness={0.8} /></mesh>
      <mesh position={[0.14, 0.7, 0]}><cylinderGeometry args={[0.09, 0.09, 0.34, 12]} /><meshStandardMaterial color="#c2410c" roughness={0.5} /></mesh>
      <mesh position={[-0.2, 0.62, 0]} rotation={[0, 0, 0.5]}><torusGeometry args={[0.14, 0.03, 8, 16, Math.PI]} /><meshStandardMaterial color="#14532D" roughness={0.6} /></mesh>
      <mesh position={[0.2, 0.62, 0]} rotation={[0, 0, 0.5]}><torusGeometry args={[0.14, 0.03, 8, 16, Math.PI]} /><meshStandardMaterial color="#14532D" roughness={0.6} /></mesh>
    </group>
  );
}

// Simple scooter: body, wheels (spin via wheelRefs), delivery box.
export function Scooter({ wheelRefs, ...props }) {
  return (
    <group {...props}>
      <group ref={wheelRefs?.body}>
        <mesh position={[0, 0.55, 0]}><boxGeometry args={[1.5, 0.28, 0.4]} /><meshStandardMaterial color="#16A34A" roughness={0.4} /></mesh>
        <mesh position={[-0.55, 0.85, 0]} rotation={[0, 0, -0.35]}><boxGeometry args={[0.16, 0.7, 0.16]} /><meshStandardMaterial color="#14532D" roughness={0.5} /></mesh>
        <mesh position={[0.5, 0.85, 0]}><boxGeometry args={[0.5, 0.4, 0.42]} /><meshStandardMaterial color="#14532D" roughness={0.55} /></mesh>
        <mesh position={[0.5, 1.12, 0]}><boxGeometry args={[0.44, 0.08, 0.36]} /><meshStandardMaterial color="#f97316" roughness={0.5} /></mesh>
      </group>
      <group ref={wheelRefs?.wheelF} position={[-0.72, 0.28, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.28, 0.12, 16]} /><meshStandardMaterial color="#292524" roughness={0.8} /></mesh>
      </group>
      <group ref={wheelRefs?.wheelB} position={[0.72, 0.28, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.28, 0.12, 16]} /><meshStandardMaterial color="#292524" roughness={0.8} /></mesh>
      </group>
    </group>
  );
}

export default Person;
