import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Helper hook: detects reduced motion preference
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// Geometry components
interface MeshElementProps {
  position: [number, number, number];
  color: string;
  visible?: boolean;
}

function Paper({ position, color, visible = true }: MeshElementProps) {
  return (
    <mesh position={position} visible={visible} castShadow receiveShadow>
      <boxGeometry args={[0.28, 0.4, 0.002]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
    </mesh>
  );
}

function Notebook({ position, color, visible = true }: MeshElementProps) {
  return (
    <mesh position={position} visible={visible} castShadow receiveShadow>
      <boxGeometry args={[0.3, 0.45, 0.02]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0} />
    </mesh>
  );
}

function GlassPanel({ position, color, visible = true }: MeshElementProps) {
  return (
    <mesh position={position} visible={visible} castShadow receiveShadow>
      <boxGeometry args={[0.32, 0.02, 0.32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.25}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}

function BrassFastener({ position, color, visible = true }: MeshElementProps) {
  return (
    <mesh position={position} visible={visible} castShadow receiveShadow>
      <cylinderGeometry args={[0.01, 0.01, 0.03, 16]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
    </mesh>
  );
}

interface DeskProps {
  currentStage?: DeskStage;
  interactive?: boolean;
  reducedMotion?: boolean;
}

// Main desk composition
function Desk({ currentStage = 'research', interactive, reducedMotion }: DeskProps) {
  // Colors from CSS variables (fallbacks)
  const root = document.documentElement;
  const ivory = root.style.getPropertyValue('--color-bg') || '#F6F3EC';
  const forest = root.style.getPropertyValue('--color-primary') || '#244737';
  const brass = root.style.getPropertyValue('--color-accent') || '#C49A55';
  const glassTint = '#315C48'; // subtle green tint

  // Visibility per workflow stage
  const researchVisible = ['research', 'draft', 'review', 'publish'].includes(currentStage);
  const draftVisible = ['draft', 'review', 'publish'].includes(currentStage);
  const reviewVisible = ['review', 'publish'].includes(currentStage);
  const publishVisible = currentStage === 'publish';

  // Parallax interaction
  const { camera, gl } = useThree();
  const [targetRot, setTargetRot] = useState([0, 0]);

  useEffect(() => {
    if (!interactive || reducedMotion) return;
    const handleMove = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTargetRot([y * 0.1, -x * 0.1]);
    };
    gl.domElement.addEventListener('pointermove', handleMove);
    return () => gl.domElement.removeEventListener('pointermove', handleMove);
  }, [interactive, reducedMotion, gl.domElement]);

  useFrame(() => {
    camera.rotation.x += (targetRot[0] - camera.rotation.x) * 0.05;
    camera.rotation.y += (targetRot[1] - camera.rotation.y) * 0.05;
  });

  return (
    <group>
      <Paper position={[-0.02, 0.005, -0.03]} color={ivory} visible={researchVisible} />
      <Paper position={[0, 0.01, 0]} color={ivory} visible={draftVisible} />
      <Paper position={[0.12, 0.015, 0.02]} color={brass} visible={reviewVisible} />
      <Notebook position={[-0.1, 0, 0]} color={forest} visible={publishVisible} />
      <GlassPanel position={[0, -0.07, 0]} color={glassTint} visible={publishVisible} />
      <BrassFastener position={[0.14, 0.03, 0]} color={brass} visible={publishVisible} />
    </group>
  );
}

export type DeskStage = 'research' | 'draft' | 'review' | 'publish';

export interface FloatingEditorialDeskProps {
  currentStage?: DeskStage;
  interactive?: boolean;
  reducedMotion?: boolean;
}

export const FloatingEditorialDesk: React.FC<FloatingEditorialDeskProps> = ({
  currentStage = 'research',
  interactive = true,
  reducedMotion,
}) => {
  const prefersReduced = useReducedMotion();
  const disableMotion = reducedMotion ?? prefersReduced;

  const lights = useMemo(
    () => (
      <>
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[2, 3, 1]}
          intensity={0.7}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-2, -1, -2]} intensity={0.2} />
      </>
    ),
    []
  );

  return (
    <div className="relative w-full h-[480px] max-w-md mx-auto">
      <Canvas shadows camera={{ position: [0.3, 0.4, 0.8], fov: 45 }} style={{ background: 'transparent' }}>
        <Suspense fallback={null}>
          {lights}
          <Desk currentStage={currentStage} interactive={interactive && !disableMotion} reducedMotion={disableMotion} />
        </Suspense>
        {!disableMotion && <OrbitControls enableZoom={false} enablePan={false} />}
      </Canvas>
    </div>
  );
};

export default FloatingEditorialDesk;
