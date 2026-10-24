'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Sparkles, Stamp } from 'lucide-react';

export interface EditorialOrrery3DProps {
  activeStageIndex: number; // 0 = Research, 1 = Drafts/Pending, 2 = Approved, 3 = Published
  onSelectStage: (stageIndex: number) => void;
  typingPulse: number; // increments on every keystroke in Quick-Dispatch input
  stampPulse: number; // increments when user Approves or Publishes a manuscript
  isDark: boolean;
  stageCounts: [number, number, number, number];
}

const STAGE_META = [
  { index: 0, code: '01', label: 'Research', angle: 0 },
  { index: 1, code: '02', label: 'Draft', angle: Math.PI * 0.5 },
  { index: 2, code: '03', label: 'Review', angle: Math.PI },
  { index: 3, code: '04', label: 'Publish', angle: Math.PI * 1.5 },
];

// Create a crisp procedural calibration dial texture for the outer brass ring
function createDialTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#C8A15A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle brushed grain lines
    ctx.strokeStyle = 'rgba(255, 248, 231, 0.25)';
    ctx.lineWidth = 1;
    for (let y = 8; y < canvas.height; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Calibration tick marks
    ctx.strokeStyle = '#18211D';
    for (let i = 0; i < 64; i++) {
      const x = (i / 64) * canvas.width;
      const isMajor = i % 16 === 0;
      const isMedium = i % 4 === 0;
      ctx.lineWidth = isMajor ? 4 : isMedium ? 2.5 : 1.5;
      const h = isMajor ? 42 : isMedium ? 26 : 14;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, canvas.height);
      ctx.lineTo(x, canvas.height - h);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

// Create a procedural archival manuscript folio texture with editorial lines and brass seal
function createFolioTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Warm archival paper
    ctx.fillStyle = '#F7F4EC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle double border
    ctx.strokeStyle = '#D5CFC0';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    // Editorial header bar (Deep Forest)
    ctx.fillStyle = '#163F32';
    ctx.fillRect(52, 56, 140, 14);

    // Brass chapter accent line
    ctx.fillStyle = '#C8A15A';
    ctx.fillRect(52, 82, 408, 4);

    // Headline blocks
    ctx.fillStyle = '#18211D';
    ctx.fillRect(52, 110, 360, 22);
    ctx.fillRect(52, 142, 270, 22);

    // 2-Column editorial body lines
    ctx.fillStyle = '#68736D';
    for (let row = 0; row < 12; row++) {
      const y = 196 + row * 26;
      ctx.fillRect(52, y, row % 4 === 3 ? 150 : 188, 9);
      ctx.fillRect(268, y, row % 3 === 2 ? 140 : 188, 9);
    }

    // Bottom right embossed brass verification seal
    ctx.beginPath();
    ctx.arc(400, 568, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#C8A15A';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#163F32';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(400, 568, 26, 0, Math.PI * 2);
    ctx.strokeStyle = '#F7F4EC';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export default function EditorialOrrery3D({
  activeStageIndex,
  onSelectStage,
  typingPulse,
  stampPulse,
  isDark,
  stageCounts,
}: EditorialOrrery3DProps) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [localStampCount, setLocalStampCount] = useState(0);

  // Store mutable props in refs so WebGL loop reads latest state without remounting
  const stateRef = useRef({
    activeStageIndex,
    isDark,
    typingEnergy: 0,
    stampImpulse: 0,
    shockwaveProgress: 0,
    userAzimuth: 0,
    userPolar: 0,
    isDragging: false,
    lastPointerX: 0,
    lastPointerY: 0,
  });

  useEffect(() => {
    stateRef.current.activeStageIndex = activeStageIndex;
  }, [activeStageIndex]);

  useEffect(() => {
    stateRef.current.isDark = isDark;
  }, [isDark]);

  useEffect(() => {
    if (typingPulse > 0) {
      stateRef.current.typingEnergy = Math.min(stateRef.current.typingEnergy + 1.8, 6.0);
    }
  }, [typingPulse]);

  useEffect(() => {
    if (stampPulse > 0 || localStampCount > 0) {
      stateRef.current.stampImpulse = 1.0;
      stateRef.current.shockwaveProgress = 0.01;
      stateRef.current.typingEnergy = Math.min(stateRef.current.typingEnergy + 2.4, 6.0);
    }
  }, [stampPulse, localStampCount]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    const bgHex = stateRef.current.isDark ? 0x101714 : 0xf4f0e6;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.065);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 3.3, 6.2);
    camera.lookAt(0, 0.15, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Mandatory RoomEnvironment Studio Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3. Three-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xfff8e7, 0x163f32, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3dc, 2.2);
    keyLight.position.set(4.5, 7.5, 5.0);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 20;
      const d = 3.5;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc8a15a, 1.35);
    rimLight.position.set(-5.0, 4.0, -4.5);
    scene.add(rimLight);

    // 4. PBR Materials & Procedural Textures
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const dialTex = createDialTexture(maxAniso);
    const folioTex = createFolioTexture(maxAniso);

    const brushedBrassMat = new THREE.MeshPhysicalMaterial({
      color: 0xc8a15a,
      metalness: 0.92,
      roughness: 0.2,
      anisotropy: 0.75,
      clearcoat: 0.3,
    });

    const dialBrassMat = new THREE.MeshStandardMaterial({
      map: dialTex,
      metalness: 0.85,
      roughness: 0.26,
    });

    const forestAnodizedMat = new THREE.MeshPhysicalMaterial({
      color: 0x163f32,
      metalness: 0.58,
      roughness: 0.36,
      clearcoat: 0.4,
    });

    const sageTrimMat = new THREE.MeshStandardMaterial({
      color: 0xb8d5c5,
      metalness: 0.45,
      roughness: 0.42,
    });

    const paperEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xe8e2d5,
      roughness: 0.85,
      metalness: 0.02,
    });

    const paperTopMat = new THREE.MeshStandardMaterial({
      map: folioTex,
      roughness: 0.72,
      metalness: 0.04,
    });

    // 5. Composite 10-Part Procedural Group (The Editorial Orrery & Press)
    const orreryRoot = new THREE.Group();
    scene.add(orreryRoot);

    // Contact shadow grounding plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 12, 128, 128, 120);
      grad.addColorStop(0, 'rgba(16, 23, 20, 0.48)');
      grad.addColorStop(1, 'rgba(16, 23, 20, 0.0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 5.2),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -0.78;
    scene.add(contactShadow);

    // Part 1: Stepped Forest Anodized Base Plinth
    const plinthBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.15, 2.32, 0.24, 64),
      forestAnodizedMat
    );
    plinthBase.position.y = -0.64;
    plinthBase.receiveShadow = true;
    orreryRoot.add(plinthBase);

    const plinthBrassBevel = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.035, 16, 64),
      brushedBrassMat
    );
    plinthBrassBevel.rotation.x = Math.PI / 2;
    plinthBrassBevel.position.y = -0.52;
    orreryRoot.add(plinthBrassBevel);

    // Part 2: Outer Calibrated Research Ring (01 Research)
    const outerRingGroup = new THREE.Group();
    outerRingGroup.position.y = -0.25;
    orreryRoot.add(outerRingGroup);

    const outerDialCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(2.02, 2.02, 0.16, 64, 1, true),
      dialBrassMat
    );
    outerRingGroup.add(outerDialCylinder);

    const outerTorusRim = new THREE.Mesh(
      new THREE.TorusGeometry(2.02, 0.055, 20, 64),
      brushedBrassMat
    );
    outerTorusRim.rotation.x = Math.PI / 2;
    outerTorusRim.position.y = 0.08;
    outerRingGroup.add(outerTorusRim);

    // Part 3: Tilted Gimbal Ring (02 Draft)
    const gimbalRingGroup = new THREE.Group();
    gimbalRingGroup.position.y = 0.05;
    orreryRoot.add(gimbalRingGroup);

    const gimbalTorus = new THREE.Mesh(
      new THREE.TorusGeometry(1.64, 0.048, 20, 64),
      brushedBrassMat
    );
    gimbalTorus.rotation.x = Math.PI / 2;
    gimbalTorus.castShadow = true;
    gimbalRingGroup.add(gimbalTorus);

    // Part 4: Review Calibration Ring (03 Review) + 4 Orbital Stage Beacons
    const reviewRingGroup = new THREE.Group();
    reviewRingGroup.position.y = 0.12;
    orreryRoot.add(reviewRingGroup);

    const reviewTorus = new THREE.Mesh(
      new THREE.TorusGeometry(1.28, 0.038, 16, 64),
      sageTrimMat
    );
    reviewTorus.rotation.x = Math.PI / 2;
    reviewRingGroup.add(reviewTorus);

    const beaconMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = i * (Math.PI / 2);
      const beacon = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 1),
        i === stateRef.current.activeStageIndex ? brushedBrassMat : forestAnodizedMat
      );
      beacon.position.set(Math.cos(angle) * 1.28, 0.04, Math.sin(angle) * 1.28);
      beacon.castShadow = true;
      reviewRingGroup.add(beacon);
      beaconMeshes.push(beacon);
    }

    // Part 5: Inner High-Polish Publish Ring (04 Publish)
    const innerRingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.045, 20, 48),
      brushedBrassMat
    );
    innerRingMesh.rotation.x = Math.PI / 2;
    innerRingMesh.position.y = 0.02;
    orreryRoot.add(innerRingMesh);

    // Part 6: Overarching Gimbaled Press Bridge Arch & Pillars
    const pressBridgeGroup = new THREE.Group();
    orreryRoot.add(pressBridgeGroup);

    const pressArch = new THREE.Mesh(
      new THREE.TorusGeometry(1.48, 0.055, 16, 48, Math.PI),
      forestAnodizedMat
    );
    pressArch.position.y = 0.02;
    pressArch.castShadow = true;
    pressBridgeGroup.add(pressArch);

    // Part 7: Central Elevating Brass Stamp Plunger / Spindle
    const plungerGroup = new THREE.Group();
    plungerGroup.position.y = 1.15;
    pressBridgeGroup.add(plungerGroup);

    const plungerRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.72, 24),
      brushedBrassMat
    );
    plungerGroup.add(plungerRod);

    const plungerSealHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.14, 32),
      brushedBrassMat
    );
    plungerSealHead.position.y = -0.36;
    plungerSealHead.castShadow = true;
    plungerGroup.add(plungerSealHead);

    // Part 8: Stacked 3D Archival Manuscript Folio Sheets in the Center
    const folioStackGroup = new THREE.Group();
    folioStackGroup.position.y = -0.18;
    orreryRoot.add(folioStackGroup);

    const folioMaterials = [
      paperEdgeMat,
      paperEdgeMat,
      paperTopMat,
      paperEdgeMat,
      paperEdgeMat,
      paperEdgeMat,
    ];

    for (let s = 0; s < 3; s++) {
      const sheet = new THREE.Mesh(
        new THREE.BoxGeometry(0.96, 0.055, 1.24),
        s === 2 ? folioMaterials : paperEdgeMat
      );
      sheet.position.y = s * 0.072;
      sheet.rotation.y = (s - 1) * 0.055;
      sheet.castShadow = true;
      sheet.receiveShadow = true;
      folioStackGroup.add(sheet);
    }

    // Part 9: Precision Stage Pointer Arm
    const pointerArmGroup = new THREE.Group();
    pointerArmGroup.position.y = -0.05;
    orreryRoot.add(pointerArmGroup);

    const pointerArmBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.04, 1.85),
      brushedBrassMat
    );
    pointerArmBar.position.z = 0.92;
    pointerArmGroup.add(pointerArmBar);

    const pointerNeedle = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.26, 16),
      brushedBrassMat
    );
    pointerNeedle.rotation.x = Math.PI / 2;
    pointerNeedle.position.z = 1.92;
    pointerArmGroup.add(pointerNeedle);

    // Part 10: Stamp Shockwave Ring (expands on Approve / Publish)
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xc8a15a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const shockwaveRing = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.68, 48),
      shockwaveMat
    );
    shockwaveRing.rotation.x = -Math.PI / 2;
    shockwaveRing.position.y = 0.06;
    orreryRoot.add(shockwaveRing);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer drag orbit handlers
    const domEl = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.lastPointerX = e.clientX;
      stateRef.current.lastPointerY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.lastPointerX;
      const dy = e.clientY - stateRef.current.lastPointerY;
      stateRef.current.lastPointerX = e.clientX;
      stateRef.current.lastPointerY = e.clientY;
      stateRef.current.userAzimuth += dx * 0.008;
      stateRef.current.userPolar = THREE.MathUtils.clamp(
        stateRef.current.userPolar + dy * 0.005,
        -0.35,
        0.45
      );
    };
    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 440;
      const h = container.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 6. Paced Animation Loop (60fps GPU / afterDraw Software WebGL)
    let frameId = 0;
    const clock = new THREE.Clock();
    const bgColorObj = new THREE.Color();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;

      // Sync theme background smoothly
      const targetHex = st.isDark ? 0x101714 : 0xf4f0e6;
      bgColorObj.setHex(targetHex);
      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(bgColorObj, 1 - Math.exp(-6 * dt));
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(bgColorObj, 1 - Math.exp(-6 * dt));
      }

      // Decay typing energy smoothly
      st.typingEnergy = THREE.MathUtils.damp(st.typingEnergy, 0, 3.2, dt);

      // Decay stamp impulse smoothly
      st.stampImpulse = THREE.MathUtils.damp(st.stampImpulse, 0, 7.5, dt);

      // Target stage angle
      const targetStageAngle = st.activeStageIndex * (Math.PI * 0.5);

      // Rotate pointer arm and outer dial ring with spring-like damping
      pointerArmGroup.rotation.y = THREE.MathUtils.damp(
        pointerArmGroup.rotation.y,
        targetStageAngle,
        6.5,
        dt
      );

      outerRingGroup.rotation.y += (0.18 + st.typingEnergy * 0.85) * dt;

      // Gimbal ring rock & spin
      gimbalRingGroup.rotation.x = Math.sin(elapsed * 1.1) * (0.14 + st.typingEnergy * 0.04);
      gimbalRingGroup.rotation.z = Math.cos(elapsed * 0.85) * 0.12;
      gimbalRingGroup.rotation.y = THREE.MathUtils.damp(
        gimbalRingGroup.rotation.y,
        -targetStageAngle * 0.5,
        4.5,
        dt
      );

      // Review ring counter-rotation
      reviewRingGroup.rotation.y -= (0.24 + st.typingEnergy * 0.5) * dt;
      beaconMeshes.forEach((b, idx) => {
        b.rotation.y += dt * 1.6;
        const isCurrent = idx === st.activeStageIndex;
        const targetScale = isCurrent ? 1.35 : 0.9;
        const nextScale = THREE.MathUtils.damp(b.scale.x, targetScale, 6, dt);
        b.scale.setScalar(nextScale);
      });

      // Plunger stamp motion + Folio stack elevation
      const stampOffset = Math.sin(st.stampImpulse * Math.PI) * 0.42;
      plungerGroup.position.y = 1.15 - stampOffset;

      const floatY = -0.18 + Math.sin(elapsed * 1.8) * 0.045 - stampOffset * 0.25;
      folioStackGroup.position.y = floatY;
      folioStackGroup.rotation.y = THREE.MathUtils.damp(
        folioStackGroup.rotation.y,
        targetStageAngle * 0.25 + st.typingEnergy * 0.12,
        5.0,
        dt
      );

      // Shockwave ring expansion on Approve / Publish
      if (st.shockwaveProgress > 0) {
        st.shockwaveProgress += dt * 1.8;
        if (st.shockwaveProgress >= 1) {
          st.shockwaveProgress = 0;
          shockwaveMat.opacity = 0;
        } else {
          const s = 1 + st.shockwaveProgress * 2.4;
          shockwaveRing.scale.set(s, s, 1);
          shockwaveMat.opacity = (1 - st.shockwaveProgress) * 0.75;
        }
      }

      // User orbit damping on root group
      orreryRoot.rotation.y = THREE.MathUtils.damp(
        orreryRoot.rotation.y,
        st.userAzimuth,
        6.0,
        dt
      );
      orreryRoot.rotation.x = THREE.MathUtils.damp(
        orreryRoot.rotation.x,
        st.userPolar,
        6.0,
        dt
      );

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      dialTex.dispose();
      folioTex.dispose();
      shadowTex.dispose();
      envTexture.dispose();
      brushedBrassMat.dispose();
      dialBrassMat.dispose();
      forestAnodizedMat.dispose();
      sageTrimMat.dispose();
      paperEdgeMat.dispose();
      paperTopMat.dispose();
      shockwaveMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[272px] rounded-xl border border-[var(--color-border)] overflow-hidden bg-[#F4F0E6] dark:bg-[#101714] select-none">
      {/* Top-Left Minimal Spec Header (100% Unobstructed Center) */}
      <div className="absolute top-3 left-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F7F4EC]/90 dark:bg-[#151E1A]/90 border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text)]">
          <Sparkles size={12} className="text-[var(--color-accent)]" />
          <span>3D Editorial Orrery & Press</span>
          <span className="text-[var(--color-text-muted)]">·</span>
          <span className="font-mono tabular-nums text-[var(--color-primary)]">
            Stage 0{activeStageIndex + 1}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setLocalStampCount((c) => c + 1)}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#163F32] text-[#F3F0E8] dark:bg-[#B8D5C5] dark:text-[#101714] text-[11px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          title="Trigger 3D Brass Press Stamp"
        >
          <Stamp size={12} />
          <span>Stamp Press</span>
        </button>
      </div>

      {/* Dedicated Isolated WebGL Canvas Mount */}
      <div
        ref={canvasMountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        title="Drag to orbit 3D Editorial Orrery"
      />

      {/* Unified Collapsible Bottom Control Dock (No backdrop-filter over WebGL) */}
      <div
        className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 w-[94%] max-w-[440px] transition-transform duration-200"
        style={{
          transform: dockCollapsed
            ? 'translate(-50%, calc(100% - 24px))'
            : 'translate(-50%, 0)',
        }}
      >
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-t-md bg-[#F7F4EC] dark:bg-[#151E1A] border border-b-0 border-[var(--color-border)] text-[10px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
          >
            {dockCollapsed ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            <span>{dockCollapsed ? 'Show Stage Controls' : 'Hide Dock'}</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#F7F4EC] dark:bg-[#151E1A] border border-[var(--color-border)] shadow-md">
          {STAGE_META.map((st) => {
            const active = activeStageIndex === st.index;
            return (
              <button
                key={st.code}
                type="button"
                onClick={() => {
                  onSelectStage(st.index);
                  setLocalStampCount((c) => c + 1);
                }}
                className={`px-2 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#163F32] text-[#F3F0E8] dark:bg-[#B8D5C5] dark:text-[#101714]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                  <span>{st.code}</span>
                  <span className="tabular-nums font-semibold">
                    {stageCounts[st.index]}
                  </span>
                </div>
                <div className="text-[11px] font-semibold truncate mt-0.5">
                  {st.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
