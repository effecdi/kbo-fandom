/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import cardGLB from '@/assets/lanyard/card.glb';
import lanyardPng from '@/assets/lanyard/lanyard.png';

extend({ MeshLineGeometry, MeshLineMaterial });

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
        camera={{ position: [0, 0, 24], fov: 20 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={Math.PI} />
        <SwingingCard
          teamColor={teamColor}
          teamName={teamName}
          playerName={playerName}
          cardImageUrl={cardImageUrl}
        />
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

/** Generate a card texture on canvas */
function useCardTexture(teamColor: string, teamName: string, playerName?: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 720;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, teamColor);
    grad.addColorStop(0.6, teamColor + 'CC');
    grad.addColorStop(1, teamColor + '88');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle scan lines
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < canvas.height; i += 4) {
      ctx.fillRect(0, i, canvas.width, 2);
    }

    // Top badge
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.roundRect(156, 40, 200, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KBO FANDOM', 256, 64);

    // Team name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(teamName, 256, 340);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(156, 370);
    ctx.lineTo(356, 370);
    ctx.stroke();

    // Player name
    if (playerName) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(playerName, 256, 420);
    }

    // Bottom text
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px sans-serif';
    ctx.fillText('2026 SEASON', 256, 670);

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    texture.needsUpdate = true;
    return texture;
  }, [teamColor, teamName, playerName]);
}

// ── Simple rope chain simulation (no WASM/Rapier) ──────────────────────────

const GRAVITY = 40;
const DAMPING = 0.96;
const SEGMENT_LEN = 1.0;
const NUM_POINTS = 4; // anchor + 3 segments
const CONSTRAINT_ITERS = 8;

interface RopePoint {
  pos: THREE.Vector3;
  prev: THREE.Vector3;
}

function createRopePoints(anchor: THREE.Vector3): RopePoint[] {
  const pts: RopePoint[] = [];
  for (let i = 0; i < NUM_POINTS; i++) {
    const p = anchor.clone().add(new THREE.Vector3(i * 0.5, -i * SEGMENT_LEN, 0));
    pts.push({ pos: p.clone(), prev: p.clone() });
  }
  return pts;
}

function solveConstraints(pts: RopePoint[], anchor: THREE.Vector3) {
  // Pin the first point to anchor
  pts[0].pos.copy(anchor);
  pts[0].prev.copy(anchor);

  for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i].pos;
      const b = pts[i + 1].pos;
      const diff = new THREE.Vector3().subVectors(b, a);
      const dist = diff.length();
      if (dist === 0) continue;
      const correction = diff.multiplyScalar((dist - SEGMENT_LEN) / dist * 0.5);
      if (i === 0) {
        // First point is pinned, only move b
        b.sub(correction.clone().multiplyScalar(2));
      } else {
        a.add(correction);
        b.sub(correction);
      }
    }
  }
}

interface SwingingCardProps {
  teamColor: string;
  teamName: string;
  playerName?: string;
  cardImageUrl?: string;
}

function SwingingCard({ teamColor, teamName, playerName, cardImageUrl }: SwingingCardProps) {
  const bandRef = useRef<any>(null);
  const cardGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const { nodes, materials } = useGLTF(cardGLB) as any;
  const bandTexture = useTexture(lanyardPng);
  const generatedTexture = useCardTexture(teamColor, teamName, playerName);

  // Custom texture from URL
  const [customTexture, setCustomTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!cardImageUrl) { setCustomTexture(null); return; }
    const loader = new THREE.TextureLoader();
    loader.load(
      cardImageUrl,
      (tex) => { tex.flipY = false; setCustomTexture(tex); },
      undefined,
      () => setCustomTexture(null),
    );
  }, [cardImageUrl]);

  const cardMap = customTexture || generatedTexture;

  // Anchor at top center
  const anchorPos = useMemo(() => new THREE.Vector3(0, 4, 0), []);

  // Rope simulation state
  const ropeRef = useRef<RopePoint[]>(createRopePoints(anchorPos));

  // Curve for drawing the band
  const [curve] = useState(
    () => new THREE.CatmullRomCurve3(
      Array.from({ length: NUM_POINTS }, () => new THREE.Vector3()),
    ),
  );

  // Drag state
  const [dragged, setDragged] = useState(false);
  const dragOffsetRef = useRef(new THREE.Vector3());
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, dragged]);

  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDragged(true);
    // Store offset from pointer to card position
    const lastPt = ropeRef.current[NUM_POINTS - 1].pos;
    dragOffsetRef.current.copy(e.point).sub(lastPt);
  }, []);

  const handlePointerUp = useCallback((e: any) => {
    e.target.releasePointerCapture(e.pointerId);
    setDragged(false);
  }, []);

  // Temp vectors (avoid allocation in frame loop)
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempDir = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30); // cap delta
    const pts = ropeRef.current;

    // Verlet integration for non-anchor points
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      const vel = p.pos.clone().sub(p.prev);
      vel.multiplyScalar(DAMPING);
      p.prev.copy(p.pos);

      // Apply gravity
      vel.y -= GRAVITY * dt * dt;

      p.pos.add(vel);
    }

    // If dragging, move the last point toward pointer
    if (dragged) {
      tempVec.set(state.pointer.x, state.pointer.y, 0.5).unproject(camera);
      tempDir.copy(tempVec).sub(camera.position).normalize();
      tempVec.copy(camera.position).add(tempDir.multiplyScalar(camera.position.length()));

      const lastPt = pts[NUM_POINTS - 1];
      lastPt.pos.lerp(tempVec.sub(dragOffsetRef.current), 0.3);
      lastPt.prev.copy(lastPt.pos);
    }

    // Solve distance constraints
    solveConstraints(pts, anchorPos);

    // Update band curve
    curve.curveType = 'chordal';
    for (let i = 0; i < NUM_POINTS; i++) {
      curve.points[i].copy(pts[i].pos);
    }
    if (bandRef.current) {
      bandRef.current.geometry.setPoints(curve.getPoints(32));
    }

    // Update card position & rotation
    if (cardGroupRef.current) {
      const cardPt = pts[NUM_POINTS - 1].pos;
      const prevPt = pts[NUM_POINTS - 2].pos;

      cardGroupRef.current.position.copy(cardPt);

      // Rotate card based on the rope direction
      const ropeDir = tempVec.subVectors(cardPt, prevPt).normalize();
      const swingAngle = Math.atan2(ropeDir.x, -ropeDir.y);
      cardGroupRef.current.rotation.z = swingAngle * 0.8;

      // Slight Y-axis rotation based on X velocity
      const xVel = cardPt.x - pts[NUM_POINTS - 1].prev.x;
      cardGroupRef.current.rotation.y += (xVel * 0.3 - cardGroupRef.current.rotation.y) * 0.1;
    }
  });

  bandTexture.wrapS = bandTexture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      {/* Card mesh */}
      <group ref={cardGroupRef}>
        <group
          scale={2.25}
          position={[0, -1.2, -0.05]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <mesh geometry={nodes.card.geometry}>
            <meshPhysicalMaterial
              map={cardMap}
              map-anisotropy={16}
              clearcoat={1}
              clearcoatRoughness={0.15}
              roughness={0.9}
              metalness={0.8}
            />
          </mesh>
          <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
          <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
        </group>
      </group>

      {/* Band (rope) */}
      <mesh ref={bandRef}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[1000, 1000]}
          useMap
          map={bandTexture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
