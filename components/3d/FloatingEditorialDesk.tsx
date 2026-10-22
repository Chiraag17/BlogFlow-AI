'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type DeskStage = 'research' | 'draft' | 'review' | 'publish';
export type CameraPreset = 'isometric' | 'manuscript' | 'macro';

export interface FloatingEditorialDeskProps {
  currentStage?: DeskStage;
  onStageChange?: (stage: DeskStage) => void;
  interactive?: boolean;
  reducedMotion?: boolean;
}

// Reusable module-scope math objects (zero GC in render loop)
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.08, 0);

const STAGE_META: Record<
  DeskStage,
  {
    index: string;
    label: string;
    agent: string;
    summary: string;
    metric: string;
    camPos: [number, number, number];
    lookAt: [number, number, number];
  }
> = {
  research: {
    index: '01',
    label: 'Research',
    agent: 'Tavily Web & Citation Agent',
    summary: 'Extracts primary sources, academic benchmarks, and SERP gaps across verified domains.',
    metric: '14 Sources Verified · 3 Key Insights',
    camPos: [-0.62, 0.72, 0.92],
    lookAt: [-0.18, 0.06, 0.04],
  },
  draft: {
    index: '02',
    label: 'Draft',
    agent: 'Gemini Long-Form Writer',
    summary: 'Synthesizes research dossiers into structured H2/H3 editorial prose with inline citations.',
    metric: '1,840 Words · 7 Min Read',
    camPos: [0.08, 0.78, 0.96],
    lookAt: [0.0, 0.08, 0.0],
  },
  review: {
    index: '03',
    label: 'Review',
    agent: 'Quality Evaluator & Human Editor',
    summary: 'Runs automated SEO, readability, and factual checks before human-in-the-loop sign-off.',
    metric: 'SEO 94/100 · Readability Grade 8.4',
    camPos: [0.58, 0.68, 0.88],
    lookAt: [0.08, 0.14, -0.02],
  },
  publish: {
    index: '04',
    label: 'Publish',
    agent: 'WordPress REST API Publisher',
    summary: 'Packages approved manuscript, metadata, and schema into an encrypted CMS draft dispatch.',
    metric: 'AES-256 Auth · WP Draft Synced',
    camPos: [0.42, 0.82, 1.08],
    lookAt: [0.0, 0.1, 0.0],
  },
};

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number]; label: string }> = {
  isometric: { pos: [0.65, 0.76, 1.05], target: [0, 0.08, 0], label: 'Studio Iso' },
  manuscript: { pos: [0.0, 1.18, 0.22], target: [0, 0.05, 0], label: 'Top-Down' },
  macro: { pos: [0.36, 0.42, 0.62], target: [0.04, 0.12, 0.02], label: 'Macro Detail' },
};

function detectSoftwareGl(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

// Procedural Canvas Texture: Primary Editorial Manuscript Page
function createManuscriptTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1448;
  const ctx = canvas.getContext('2d')!;

  // Warm archival paper background
  ctx.fillStyle = '#F7F4EC';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper grain border & editorial margin rule
  ctx.strokeStyle = 'rgba(22, 63, 50, 0.16)';
  ctx.lineWidth = 3;
  ctx.strokeRect(56, 56, canvas.width - 112, canvas.height - 112);

  // Top editorial header bar
  ctx.fillStyle = '#163F32';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('BLOGFLOW AI  ·  EDITORIAL MANUSCRIPT', 96, 118);

  ctx.fillStyle = '#C8A15A';
  ctx.fillRect(96, 138, 832, 3);

  // Article Title
  ctx.fillStyle = '#18211D';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillText('The Architecture of', 96, 220);
  ctx.fillText('Autonomous Publishing', 96, 282);

  // Metadata row
  ctx.fillStyle = '#68736D';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText('DRAFT #042   ·   1,840 WORDS   ·   SEO SCORE 94/100', 96, 336);

  // Highlighted callout box
  ctx.fillStyle = 'rgba(22, 63, 50, 0.06)';
  ctx.fillRect(96, 376, 832, 130);
  ctx.fillStyle = '#163F32';
  ctx.fillRect(96, 376, 8, 130);
  ctx.fillStyle = '#244737';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('“Synthesis grounded in primary citations transforms', 128, 430);
  ctx.fillText('automated drafts into authoritative journalism.” [1][2]', 128, 472);

  // Section 01 Heading
  ctx.fillStyle = '#18211D';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText('01. Multi-Source Research Verification', 96, 576);

  // Simulated crisp editorial paragraph lines
  const lineWidths = [820, 790, 832, 760, 810, 640];
  ctx.fillStyle = 'rgba(24, 33, 29, 0.55)';
  lineWidths.forEach((w, idx) => {
    ctx.fillRect(96, 612 + idx * 32, w, 12);
  });

  // Brass citation highlight pill
  ctx.fillStyle = 'rgba(200, 161, 90, 0.25)';
  ctx.fillRect(96, 824, 480, 28);
  ctx.fillStyle = '#8A6928';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('CITATION VERIFIED: MIT TECH REVIEW (2026)', 108, 844);

  // Section 02 Heading
  ctx.fillStyle = '#18211D';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText('02. Semantic Structure & Readability', 96, 920);

  const lineWidths2 = [800, 830, 770, 810, 790, 520];
  ctx.fillStyle = 'rgba(24, 33, 29, 0.5)';
  lineWidths2.forEach((w, idx) => {
    ctx.fillRect(96, 956 + idx * 32, w, 12);
  });

  // Two-column bottom data diagram
  ctx.strokeStyle = 'rgba(22, 63, 50, 0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(96, 1180, 396, 160);
  ctx.strokeRect(532, 1180, 396, 160);

  ctx.fillStyle = '#163F32';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('KEYWORD DENSITY: 1.6%', 124, 1225);
  ctx.fillStyle = '#C8A15A';
  ctx.fillRect(124, 1250, 310, 16);
  ctx.fillStyle = 'rgba(22, 63, 50, 0.2)';
  ctx.fillRect(124, 1284, 240, 16);

  ctx.fillStyle = '#163F32';
  ctx.fillText('HUMAN APPROVAL: READY', 560, 1225);
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(560, 1250, 330, 16);
  ctx.fillStyle = 'rgba(22, 63, 50, 0.2)';
  ctx.fillRect(560, 1284, 280, 16);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

// Procedural Canvas Texture: Research Citation Dossier Card
function createResearchCardTexture(title: string, domain: string, accentHex: string, maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#EFECE2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top color bar
  ctx.fillStyle = accentHex;
  ctx.fillRect(0, 0, canvas.width, 22);

  ctx.fillStyle = '#163F32';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(domain.toUpperCase(), 36, 72);

  ctx.fillStyle = '#18211D';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(title, 36, 126);

  ctx.fillStyle = 'rgba(24, 33, 29, 0.45)';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(36, 180 + i * 34, i === 7 ? 260 : 420 - (i % 3) * 30, 12);
  }

  // Bottom verification stamp
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 520, 440, 100);
  ctx.fillStyle = accentHex;
  ctx.font = 'bold 22px monospace';
  ctx.fillText('✓ SOURCE INDEXED BY TAVILY', 64, 578);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

// Procedural Canvas Texture: Review Telemetry HUD Overlay Slab
function createTelemetryHudTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Subtle dark emerald glass backing
  ctx.fillStyle = 'rgba(16, 32, 25, 0.86)';
  ctx.fillRect(16, 16, canvas.width - 32, canvas.height - 32);

  ctx.strokeStyle = '#D4AF67';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

  ctx.fillStyle = '#D4AF67';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('QUALITY & SEO GATEKEEPER  ·  STAGE 03', 48, 72);

  ctx.fillStyle = '#F3F0E8';
  ctx.font = 'bold 76px Georgia, serif';
  ctx.fillText('94', 48, 178);

  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('EXCELLENT  ·  READY FOR APPROVAL', 165, 145);

  ctx.fillStyle = '#B8D5C5';
  ctx.font = '20px monospace';
  ctx.fillText('READABILITY: GRADE 8.4   |   CITATIONS: 100%', 165, 180);

  // Metric bars
  const metrics = [
    { name: 'Semantic Heading Hierarchy', pct: 0.96 },
    { name: 'Primary Keyword Placement', pct: 0.92 },
    { name: 'Factual Source Grounding', pct: 0.98 },
    { name: 'Brand Tone Alignment', pct: 0.91 },
  ];

  metrics.forEach((m, i) => {
    const y = 240 + i * 58;
    ctx.fillStyle = '#F3F0E8';
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillText(m.name, 48, y);

    ctx.fillStyle = 'rgba(184, 213, 197, 0.18)';
    ctx.fillRect(48, y + 12, 660, 14);

    ctx.fillStyle = i % 2 === 0 ? '#4ade80' : '#D4AF67';
    ctx.fillRect(48, y + 12, Math.round(660 * m.pct), 14);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

// Procedural Radial Contact Shadow Texture
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 120);
  grad.addColorStop(0, 'rgba(10, 20, 15, 0.55)');
  grad.addColorStop(0.55, 'rgba(10, 20, 15, 0.22)');
  grad.addColorStop(1, 'rgba(10, 20, 15, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export const FloatingEditorialDesk: React.FC<FloatingEditorialDeskProps> = ({
  currentStage = 'research',
  onStageChange,
  interactive = true,
  reducedMotion = false,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [activeStage, setActiveStage] = useState<DeskStage>(currentStage);
  const [exploded, setExploded] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  // Sync external prop changes
  useEffect(() => {
    setActiveStage(currentStage);
    setCameraPreset(null);
  }, [currentStage]);

  // Refs for animation loop access without re-mounting WebGL
  const stageRef = useRef<DeskStage>(activeStage);
  const explodedRef = useRef<number>(exploded);
  const presetRef = useRef<CameraPreset | null>(cameraPreset);
  const userDraggingRef = useRef<boolean>(false);
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    stageRef.current = activeStage;
    requestRenderRef.current?.();
  }, [activeStage]);

  useEffect(() => {
    explodedRef.current = exploded;
    requestRenderRef.current?.();
  }, [exploded]);

  useEffect(() => {
    presetRef.current = cameraPreset;
    if (cameraPreset) {
      userDraggingRef.current = false;
    }
    requestRenderRef.current?.();
  }, [cameraPreset]);

  const handleSelectStage = useCallback(
    (stage: DeskStage) => {
      setActiveStage(stage);
      setCameraPreset(null);
      userDraggingRef.current = false;
      onStageChange?.(stage);
    },
    [onStageChange]
  );

  // Keyboard shortcut 'H' to toggle bottom control dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const isSoftwareGl = detectSoftwareGl();
    const width = mountEl.clientWidth || 640;
    const height = mountEl.clientHeight || 520;

    // 1. Renderer setup with Software-WebGL guard & ACES Filmic tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    // 2. Scene & Studio Environment Map (RoomEnvironment + PMREMGenerator)
    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 25);
    camera.position.set(-0.62, 0.72, 0.92);
    camera.lookAt(0, 0.08, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl && !reducedMotion;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI * 0.12;
    controls.maxPolarAngle = Math.PI * 0.44;
    controls.target.set(0, 0.08, 0);

    // 4. Balanced 3-Point Studio Lighting Rig + Cool/Warm Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0xf7f4ec, 0x163f32, 0.65);
    hemiLight.position.set(0, 3, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e4, 1.45);
    keyLight.position.set(1.8, 2.6, 1.6);
    keyLight.castShadow = !isSoftwareGl;
    const d = 1.1;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 6;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xcce5d7, 0.55);
    fillLight.position.set(-1.8, 1.4, 1.1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd4af67, 0.7);
    rimLight.position.set(0.2, 1.8, -1.8);
    scene.add(rimLight);

    // 5. Materials & Procedural Textures
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const manuscriptTex = createManuscriptTexture(maxAniso);
    const researchTex1 = createResearchCardTexture('AI Search Systems', 'MIT Tech Review', '#163F32', maxAniso);
    const researchTex2 = createResearchCardTexture('Citation Grounding', 'Nature Journal', '#C8A15A', maxAniso);
    const researchTex3 = createResearchCardTexture('SERP Benchmark', 'Editorial Lab', '#21759B', maxAniso);
    const hudTex = createTelemetryHudTexture(maxAniso);
    const shadowTex = createContactShadowTexture();

    const walnutMat = new THREE.MeshStandardMaterial({
      color: 0x261c15,
      roughness: 0.42,
      metalness: 0.08,
    });

    const blotterMat = new THREE.MeshStandardMaterial({
      color: 0x163f32,
      roughness: 0.74,
      metalness: 0.05,
    });

    const brushedBrassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af67,
      roughness: 0.22,
      metalness: 0.92,
      anisotropy: 0.75,
      clearcoat: 0.35,
    });

    const darkForestClothMat = new THREE.MeshStandardMaterial({
      color: 0x122b22,
      roughness: 0.68,
      metalness: 0.06,
    });

    const paperEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xf3efe4,
      roughness: 0.82,
      metalness: 0.0,
    });

    const manuscriptTopMat = new THREE.MeshStandardMaterial({
      map: manuscriptTex,
      roughness: 0.65,
      metalness: 0.02,
    });

    const loupeGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe6f4ed,
      roughness: 0.08,
      metalness: 0.0,
      transmission: isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: isSoftwareGl ? 0.38 : 1.0,
      ior: 1.52,
      thickness: 0.08,
      clearcoat: 1.0,
      depthWrite: false,
    });

    const hudSlabMat = new THREE.MeshPhysicalMaterial({
      map: hudTex,
      roughness: 0.14,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.95,
    });

    // 6. Composite Multi-Part 3D Scene Assembly (THREE.Group)
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Contact Shadow Grounding Plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.65, 1.35),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.055;
    rootGroup.add(shadowPlane);

    // A. Desk Plinth & Leather Blotter Assembly
    const deskGroup = new THREE.Group();
    rootGroup.add(deskGroup);

    const plinthMesh = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.045, 0.84), walnutMat);
    plinthMesh.position.y = -0.0225;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    deskGroup.add(plinthMesh);

    // Brass perimeter inlay rail
    const brassFrameMesh = new THREE.Mesh(new THREE.BoxGeometry(1.175, 0.012, 0.855), brushedBrassMat);
    brassFrameMesh.position.y = -0.015;
    deskGroup.add(brassFrameMesh);

    // Forest Green Editorial Leather Blotter Mat (offset on Y to prevent Z-fighting)
    const blotterMesh = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.012, 0.74), blotterMat);
    blotterMesh.position.y = 0.006;
    blotterMesh.receiveShadow = true;
    deskGroup.add(blotterMesh);

    // B. Stage 1 Assembly: Research Dossiers, Ledger & Brushed Brass Magnifying Loupe
    const researchGroup = new THREE.Group();
    researchGroup.position.set(-0.28, 0.02, 0.05);
    rootGroup.add(researchGroup);

    // Hardbound Research Ledger
    const ledgerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.032, 0.38), darkForestClothMat);
    ledgerMesh.position.set(-0.04, 0.016, -0.06);
    ledgerMesh.rotation.y = 0.14;
    ledgerMesh.castShadow = true;
    ledgerMesh.receiveShadow = true;
    researchGroup.add(ledgerMesh);

    const ledgerPages = new THREE.Mesh(new THREE.BoxGeometry(0.265, 0.024, 0.365), paperEdgeMat);
    ledgerPages.position.set(-0.035, 0.016, -0.06);
    ledgerPages.rotation.y = 0.14;
    researchGroup.add(ledgerPages);

    // 3 Fanned Citation Cards with procedural textures
    const cardConfigs = [
      { tex: researchTex1, pos: [-0.02, 0.038, -0.04] as [number, number, number], rotY: 0.22 },
      { tex: researchTex2, pos: [0.02, 0.044, 0.02] as [number, number, number], rotY: 0.06 },
      { tex: researchTex3, pos: [0.05, 0.05, 0.08] as [number, number, number], rotY: -0.12 },
    ];
    cardConfigs.forEach((cfg) => {
      const cardMat = [
        paperEdgeMat,
        paperEdgeMat,
        new THREE.MeshStandardMaterial({ map: cfg.tex, roughness: 0.65 }),
        paperEdgeMat,
        paperEdgeMat,
        paperEdgeMat,
      ];
      const card = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.004, 0.3), cardMat);
      card.position.set(...cfg.pos);
      card.rotation.y = cfg.rotY;
      card.castShadow = true;
      card.receiveShadow = true;
      researchGroup.add(card);
    });

    // Multi-part Brushed Brass Magnifying Loupe
    const loupeGroup = new THREE.Group();
    loupeGroup.position.set(0.04, 0.09, 0.05);
    loupeGroup.rotation.set(0.15, -0.35, 0.08);
    researchGroup.add(loupeGroup);

    const loupeRim = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.008, 16, 48), brushedBrassMat);
    loupeRim.rotation.x = Math.PI / 2;
    loupeRim.castShadow = true;
    loupeGroup.add(loupeRim);

    const loupeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.006, 32), loupeGlassMat);
    loupeLens.renderOrder = 2;
    loupeGroup.add(loupeLens);

    const loupeHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.01, 0.13, 16), walnutMat);
    loupeHandle.rotation.x = Math.PI / 2;
    loupeHandle.position.set(0, 0, 0.13);
    loupeHandle.castShadow = true;
    loupeGroup.add(loupeHandle);

    const loupeCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.022, 16), brushedBrassMat);
    loupeCollar.rotation.x = Math.PI / 2;
    loupeCollar.position.set(0, 0, 0.072);
    loupeGroup.add(loupeCollar);

    // C. Stage 2 Assembly: Primary Manuscript Stack & Multi-Part Fountain Pen
    const draftGroup = new THREE.Group();
    draftGroup.position.set(0.04, 0.02, 0.02);
    rootGroup.add(draftGroup);

    // Underlying paper stack sheets
    for (let i = 0; i < 3; i++) {
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.005, 0.48), paperEdgeMat);
      sheet.position.set((i - 1) * 0.006, 0.004 + i * 0.006, (1 - i) * 0.005);
      sheet.rotation.y = (i - 1) * 0.025;
      sheet.castShadow = true;
      sheet.receiveShadow = true;
      draftGroup.add(sheet);
    }

    // Top Hero Manuscript Sheet with high-res typography
    const heroSheetMats = [
      paperEdgeMat,
      paperEdgeMat,
      manuscriptTopMat,
      paperEdgeMat,
      paperEdgeMat,
      paperEdgeMat,
    ];
    const heroSheet = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.006, 0.48), heroSheetMats);
    heroSheet.position.set(0, 0.024, 0);
    heroSheet.castShadow = true;
    heroSheet.receiveShadow = true;
    draftGroup.add(heroSheet);

    // Multi-Part Editorial Fountain Pen (Barrel, Grip, Gold Nib, Clip)
    const penGroup = new THREE.Group();
    penGroup.position.set(0.22, 0.045, 0.04);
    penGroup.rotation.set(0.08, -0.42, -0.18);
    draftGroup.add(penGroup);

    const penBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.24, 20), darkForestClothMat);
    penBarrel.rotation.x = Math.PI / 2;
    penBarrel.castShadow = true;
    penGroup.add(penBarrel);

    const penBand = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, 0.016, 20), brushedBrassMat);
    penBand.rotation.x = Math.PI / 2;
    penBand.position.z = 0.02;
    penGroup.add(penBand);

    const penNib = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.042, 16), brushedBrassMat);
    penNib.rotation.x = -Math.PI / 2;
    penNib.position.z = -0.14;
    penNib.castShadow = true;
    penGroup.add(penNib);

    const penClip = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.006, 0.08), brushedBrassMat);
    penClip.position.set(0, 0.013, 0.06);
    penGroup.add(penClip);

    // D. Stage 3 Assembly: Quality & SEO Verification Glass Slab + Brass Approval Seal
    const reviewGroup = new THREE.Group();
    reviewGroup.position.set(0.06, 0.14, -0.02);
    rootGroup.add(reviewGroup);

    const hudSlabMats = [
      brushedBrassMat,
      brushedBrassMat,
      hudSlabMat,
      paperEdgeMat,
      brushedBrassMat,
      brushedBrassMat,
    ];
    const hudSlab = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.01, 0.26), hudSlabMats);
    hudSlab.castShadow = true;
    hudSlab.renderOrder = 3;
    reviewGroup.add(hudSlab);

    // Multi-part Brushed Brass Editorial Approval Stamp
    const sealGroup = new THREE.Group();
    sealGroup.position.set(0.25, -0.05, 0.14);
    reviewGroup.add(sealGroup);

    const sealBase = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.018, 28), brushedBrassMat);
    sealBase.castShadow = true;
    sealGroup.add(sealBase);

    const sealNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 0.045, 24), brushedBrassMat);
    sealNeck.position.y = 0.03;
    sealGroup.add(sealNeck);

    const sealHandle = new THREE.Mesh(new THREE.SphereGeometry(0.028, 24, 24), walnutMat);
    sealHandle.position.y = 0.068;
    sealHandle.castShadow = true;
    sealGroup.add(sealHandle);

    // E. Stage 4 Assembly: Bound Publication Folio & CMS Dispatch Module
    const publishGroup = new THREE.Group();
    publishGroup.position.set(0.32, 0.03, -0.06);
    rootGroup.add(publishGroup);

    const folioCover = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.036, 0.36), darkForestClothMat);
    folioCover.castShadow = true;
    folioCover.receiveShadow = true;
    publishGroup.add(folioCover);

    const folioSpine = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.038, 0.364), brushedBrassMat);
    folioSpine.position.x = -0.122;
    publishGroup.add(folioSpine);

    const folioBadge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.004, 0.06), brushedBrassMat);
    folioBadge.position.set(0.01, 0.02, -0.04);
    publishGroup.add(folioBadge);

    // Brass corner clasps
    const claspOffsets: [number, number][] = [
      [0.115, 0.165],
      [0.115, -0.165],
    ];
    claspOffsets.forEach(([cx, cz]) => {
      const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.04, 0.032), brushedBrassMat);
      clasp.position.set(cx, 0, cz);
      publishGroup.add(clasp);
    });

    // Pre-compile shaders on hardware WebGL
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 7. On-Demand / Paced Animation Loop with Exponential Damping
    let frameId = 0;
    let isDisposed = false;
    let renderBusy = false;
    let renderDirty = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function stepScene(): boolean {
      const dt = Math.min(clock.getDelta(), 0.1) || 0.016;
      const st = stageRef.current;
      const exp = explodedRef.current;
      const preset = presetRef.current;
      const lambda = reducedMotion ? 25 : 6.5;

      // Target vertical & horizontal separations per stage + exploded slider
      const researchTargetY = (st === 'research' ? 0.065 : 0.02) + exp * 0.12;
      const researchTargetX = -0.28 - exp * 0.1;

      const draftTargetY = (st === 'draft' ? 0.055 : 0.02) + exp * 0.18;
      const penTargetY = st === 'draft' ? 0.085 + exp * 0.08 : 0.038;
      const penTargetRotZ = st === 'draft' ? -0.35 : -0.12;

      const reviewTargetY =
        (st === 'review' ? 0.16 : st === 'publish' ? 0.11 : 0.04) + exp * 0.28;
      const reviewTargetScale = st === 'review' || st === 'publish' || exp > 0.15 ? 1.0 : 0.001;

      const publishTargetY = (st === 'publish' ? 0.095 : 0.028) + exp * 0.22;
      const publishTargetX = 0.33 + exp * 0.1;
      const publishTargetRotZ = st === 'publish' ? 0.08 : 0.0;

      // Apply exponential damping
      researchGroup.position.y = THREE.MathUtils.damp(researchGroup.position.y, researchTargetY, lambda, dt);
      researchGroup.position.x = THREE.MathUtils.damp(researchGroup.position.x, researchTargetX, lambda, dt);
      loupeGroup.position.y = THREE.MathUtils.damp(
        loupeGroup.position.y,
        st === 'research' ? 0.115 : 0.075,
        lambda,
        dt
      );
      loupeGroup.rotation.y = THREE.MathUtils.damp(
        loupeGroup.rotation.y,
        st === 'research' ? -0.15 : -0.45,
        lambda,
        dt
      );

      draftGroup.position.y = THREE.MathUtils.damp(draftGroup.position.y, draftTargetY, lambda, dt);
      penGroup.position.y = THREE.MathUtils.damp(penGroup.position.y, penTargetY, lambda, dt);
      penGroup.rotation.z = THREE.MathUtils.damp(penGroup.rotation.z, penTargetRotZ, lambda, dt);

      reviewGroup.position.y = THREE.MathUtils.damp(reviewGroup.position.y, reviewTargetY, lambda, dt);
      const nextScale = THREE.MathUtils.damp(reviewGroup.scale.x, reviewTargetScale, lambda, dt);
      reviewGroup.scale.setScalar(Math.max(0.001, nextScale));
      reviewGroup.visible = nextScale > 0.02;

      publishGroup.position.y = THREE.MathUtils.damp(publishGroup.position.y, publishTargetY, lambda, dt);
      publishGroup.position.x = THREE.MathUtils.damp(publishGroup.position.x, publishTargetX, lambda, dt);
      publishGroup.rotation.z = THREE.MathUtils.damp(publishGroup.rotation.z, publishTargetRotZ, lambda, dt);

      // Camera choreography (unless user started manual orbit drag)
      let camMoving = false;
      if (!userDraggingRef.current) {
        const camConfig = preset
          ? { camPos: CAMERA_PRESETS[preset].pos, lookAt: CAMERA_PRESETS[preset].target }
          : STAGE_META[st];

        _targetCamPos.set(...camConfig.camPos);
        _targetLookAt.set(...camConfig.lookAt);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, lambda, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, lambda, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, lambda, dt);

        _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _targetLookAt.x, lambda, dt);
        _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _targetLookAt.y, lambda, dt);
        _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _targetLookAt.z, lambda, dt);

        controls.target.copy(_currentLookAt);
        camMoving =
          camera.position.distanceToSquared(_targetCamPos) > 0.00005 ||
          _currentLookAt.distanceToSquared(_targetLookAt) > 0.00005;
      }

      controls.update();

      const propsMoving =
        Math.abs(researchGroup.position.y - researchTargetY) > 0.0005 ||
        Math.abs(draftGroup.position.y - draftTargetY) > 0.0005 ||
        Math.abs(reviewGroup.position.y - reviewTargetY) > 0.0005 ||
        Math.abs(publishGroup.position.y - publishTargetY) > 0.0005 ||
        Math.abs(reviewGroup.scale.x - reviewTargetScale) > 0.002;

      return camMoving || propsMoving;
    }

    function requestRender() {
      if (isDisposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (isDisposed) return;
        renderDirty = false;
        const stillTransitioning = stepScene();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || stillTransitioning) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    requestRenderRef.current = requestRender;

    const onControlStart = () => {
      userDraggingRef.current = true;
      requestRender();
    };
    const onControlChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('change', onControlChange);

    const onResize = () => {
      if (!mountEl || isDisposed) return;
      const w = mountEl.clientWidth || 640;
      const h = mountEl.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    // Initial render
    clock.start();
    requestRender();

    return () => {
      isDisposed = true;
      requestRenderRef.current = null;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      controls.dispose();

      // Dispose geometries, materials & textures
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      manuscriptTex.dispose();
      researchTex1.dispose();
      researchTex2.dispose();
      researchTex3.dispose();
      hudTex.dispose();
      shadowTex.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, [interactive, reducedMotion]);

  const currentMeta = STAGE_META[activeStage];

  return (
    <div className="lp-desk-studio" aria-label="Interactive 3D Editorial Studio Desk">
      {/* Minimal Top-Left Spec Header (Unobstructed Center Viewport) */}
      <div className="lp-desk-hud-top">
        <div className="lp-desk-spec-kicker">
          <span>STAGE {currentMeta.index}</span>
          <span aria-hidden="true">·</span>
          <span>{currentMeta.agent}</span>
        </div>
        <div className="lp-desk-spec-metric">{currentMeta.metric}</div>
      </div>

      {/* Isolated WebGL Canvas Container */}
      <div
        ref={canvasMountRef}
        className="lp-desk-canvas-mount"
        role="img"
        aria-label={`3D Editorial Desk showing stage ${currentMeta.label}: ${currentMeta.summary}`}
      />

      {/* Unified Collapsible Bottom Control Dock (Zero Backdrop-Filter over WebGL) */}
      <div className={`lp-desk-dock-wrapper${dockCollapsed ? ' is-collapsed' : ''}`}>
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          className="lp-desk-dock-toggle"
          title="Toggle 3D Controls (Shortcut: H)"
        >
          {dockCollapsed ? '▴ Show Studio Controls (H)' : '▾ Hide Controls (H)'}
        </button>

        <div className="lp-desk-dock">
          {/* Stage Selector Buttons */}
          <div className="lp-desk-dock-group" role="tablist" aria-label="Editorial workflow stages">
            {(Object.keys(STAGE_META) as DeskStage[]).map((stageKey) => {
              const info = STAGE_META[stageKey];
              const isSelected = activeStage === stageKey;
              return (
                <button
                  key={stageKey}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectStage(stageKey)}
                  className={`lp-desk-stage-btn${isSelected ? ' active' : ''}`}
                >
                  <span className="lp-desk-stage-idx">{info.index}.</span>
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>

          <div className="lp-desk-dock-divider" aria-hidden="true" />

          {/* Exploded View Slider */}
          <div className="lp-desk-dock-slider">
            <label htmlFor="desk-explode-range" className="lp-desk-slider-label">
              Explode Layers
            </label>
            <input
              id="desk-explode-range"
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={exploded}
              onChange={(e) => setExploded(parseFloat(e.target.value))}
              className="lp-desk-range"
            />
          </div>

          <div className="lp-desk-dock-divider" aria-hidden="true" />

          {/* Camera Preset Selector */}
          <div className="lp-desk-dock-cameras" aria-label="Camera angle presets">
            {(Object.keys(CAMERA_PRESETS) as CameraPreset[]).map((presetKey) => {
              const p = CAMERA_PRESETS[presetKey];
              return (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => setCameraPreset(presetKey)}
                  className={`lp-desk-cam-btn${cameraPreset === presetKey ? ' active' : ''}`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingEditorialDesk;
