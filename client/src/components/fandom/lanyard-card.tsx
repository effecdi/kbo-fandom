/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface LanyardCardProps {
  teamColor?: string;
  teamName?: string;
  playerName?: string;
  cardImageUrl?: string;
  height?: number;
}

export default function LanyardCard({
  teamColor = '#7B2FF7',
  teamName = 'KBO',
  playerName,
  cardImageUrl,
  height = 400,
}: LanyardCardProps) {
  return (
    <div className="relative z-0 w-full flex justify-center items-center" style={{ height }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 35 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-3, -2, 4]} intensity={0.5} />
        <SwingingCard
          teamColor={teamColor}
          teamName={teamName}
          playerName={playerName}
          cardImageUrl={cardImageUrl}
        />
      </Canvas>
    </div>
  );
}

// ── Card texture generation ────────────────────────────────────────────────

function useCardTexture(teamColor: string, teamName: string, playerName?: string) {
  return useMemo(() => {
    const W = 512, H = 720;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, teamColor);
    grad.addColorStop(0.5, teamColor + 'DD');
    grad.addColorStop(1, teamColor + '99');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle noise overlay
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < H; i += 3) {
      ctx.fillRect(0, i, W, 1);
    }

    // Top pill badge
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 80, 50, 160, 32, 16);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('KBO FANDOM', W / 2, 66);

    // Team abbreviation — big circle
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.arc(W / 2, 240, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(teamName.slice(0, 2), W / 2, 244);

    // Team full name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText(teamName, W / 2, 370);

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 60, 400);
    ctx.lineTo(W / 2 + 60, 400);
    ctx.stroke();

    // Player name
    if (playerName) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(playerName, W / 2, 440);
    }

    // Bottom
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('2026 SEASON', W / 2, H - 40);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [teamColor, teamName, playerName]);
}

// ── Verlet rope simulation ────────────────────────────────────────────────

const GRAVITY = 9.8;
const DAMPING = 0.97;
const SEG_LEN = 0.6;
const NUM_PTS = 5;
const ITERS = 10;

interface Pt { pos: THREE.Vector3; prev: THREE.Vector3 }

function initRope(anchor: THREE.Vector3): Pt[] {
  return Array.from({ length: NUM_PTS }, (_, i) => {
    const p = anchor.clone().add(new THREE.Vector3(0, -i * SEG_LEN, 0));
    return { pos: p.clone(), prev: p.clone() };
  });
}

function stepRope(pts: Pt[], anchor: THREE.Vector3, dt: number) {
  // Pin anchor
  pts[0].pos.copy(anchor);
  pts[0].prev.copy(anchor);

  // Verlet integration
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    const vx = (p.pos.x - p.prev.x) * DAMPING;
    const vy = (p.pos.y - p.prev.y) * DAMPING;
    const vz = (p.pos.z - p.prev.z) * DAMPING;
    p.prev.copy(p.pos);
    p.pos.x += vx;
    p.pos.y += vy - GRAVITY * dt * dt;
    p.pos.z += vz;
  }

  // Distance constraints
  for (let iter = 0; iter < ITERS; iter++) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i].pos;
      const b = pts[i + 1].pos;
      const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 0.001) continue;
      const diff = (dist - SEG_LEN) / dist;
      const cx = dx * diff * 0.5, cy = dy * diff * 0.5, cz = dz * diff * 0.5;
      if (i > 0) { a.x += cx; a.y += cy; a.z += cz; }
      b.x -= cx; b.y -= cy; b.z -= cz;
    }
    // Re-pin anchor
    pts[0].pos.copy(anchor);
  }
}

// ── 3D Scene ──────────────────────────────────────────────────────────────

function SwingingCard({ teamColor, teamName, playerName, cardImageUrl }: {
  teamColor: string; teamName: string; playerName?: string; cardImageUrl?: string;
}) {
  const cardRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const texture = useCardTexture(teamColor, teamName, playerName);

  // Custom image texture
  const [imgTex, setImgTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!cardImageUrl) { setImgTex(null); return; }
    new THREE.TextureLoader().load(cardImageUrl, (t) => setImgTex(t), undefined, () => setImgTex(null));
  }, [cardImageUrl]);

  const cardMap = imgTex || texture;

  const anchor = useMemo(() => new THREE.Vector3(0, 3.5, 0), []);
  const rope = useRef<Pt[]>(initRope(anchor));
  const isDragging = useRef(false);
  const dragOffset = useRef(new THREE.Vector3());
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? (isDragging.current ? 'grabbing' : 'grab') : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);

  const onDown = useCallback((e: any) => {
    e.stopPropagation();
    (e.target as any).setPointerCapture(e.pointerId);
    isDragging.current = true;
    document.body.style.cursor = 'grabbing';
    const last = rope.current[NUM_PTS - 1].pos;
    dragOffset.current.copy(e.point).sub(last);
  }, []);

  const onUp = useCallback((e: any) => {
    (e.target as any).releasePointerCapture(e.pointerId);
    isDragging.current = false;
    document.body.style.cursor = hovered ? 'grab' : 'auto';
  }, [hovered]);

  // Reusable vectors
  const _v = useMemo(() => new THREE.Vector3(), []);
  const _d = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const pts = rope.current;

    // Drag → move last point toward pointer
    if (isDragging.current) {
      _v.set(state.pointer.x, state.pointer.y, 0.5).unproject(camera);
      _d.copy(_v).sub(camera.position).normalize();
      _v.copy(camera.position).add(_d.multiplyScalar(camera.position.length()));
      _v.sub(dragOffset.current);
      const last = pts[NUM_PTS - 1];
      last.pos.lerp(_v, 0.4);
      last.prev.copy(last.pos);
    }

    stepRope(pts, anchor, dt);

    // Update card
    if (cardRef.current) {
      const last = pts[NUM_PTS - 1].pos;
      const prev = pts[NUM_PTS - 2].pos;
      cardRef.current.position.copy(last);

      // Swing rotation from rope angle
      const swing = Math.atan2(last.x - prev.x, -(last.y - prev.y));
      cardRef.current.rotation.z = swing * 0.7;

      // Subtle Y rotation from velocity
      const vx = last.x - pts[NUM_PTS - 1].prev.x;
      cardRef.current.rotation.y += (vx * 2 - cardRef.current.rotation.y) * 0.08;
    }
  });

  // Card dimensions (real ID card ratio ≈ 85.6 x 54mm → 3:2 portrait → 1.0 x 1.4)
  const cardW = 1.8, cardH = 2.5, cardR = 0.1;

  // Rounded rect shape
  const cardShape = useMemo(() => {
    const shape = new THREE.Shape();
    const r = cardR, w = cardW / 2, h = cardH / 2;
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);
    return shape;
  }, []);

  const cardGeo = useMemo(() => {
    return new THREE.ExtrudeGeometry(cardShape, { depth: 0.02, bevelEnabled: false });
  }, [cardShape]);

  return (
    <>
      {/* Card */}
      <group ref={cardRef}>
        <mesh
          geometry={cardGeo}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onPointerDown={onDown}
          onPointerUp={onUp}
        >
          <meshPhysicalMaterial
            map={cardMap}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
            roughness={0.4}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Clip at top */}
        <mesh position={[0, cardH / 2 + 0.08, 0.01]}>
          <cylinderGeometry args={[0.04, 0.04, 0.16, 8]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Band tube */}
      <BandTube rope={rope} anchor={anchor} color={teamColor} />
    </>
  );
}

/** Tube-based band for visible thickness */
function BandTube({ rope, anchor, color }: { rope: React.RefObject<Pt[]>; anchor: THREE.Vector3; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current || !rope.current) return;
    const pts = rope.current;
    const curve = new THREE.CatmullRomCurve3(pts.map(p => p.pos.clone()), false, 'chordal');
    const geo = new THREE.TubeGeometry(curve, 32, 0.04, 6, false);
    meshRef.current.geometry.dispose();
    meshRef.current.geometry = geo;
  });

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[new THREE.CatmullRomCurve3([anchor.clone(), anchor.clone().add(new THREE.Vector3(0, -1, 0))]), 4, 0.04, 6, false]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
    </mesh>
  );
}
