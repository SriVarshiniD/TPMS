import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, RefreshCw, ZoomIn, Eye, Sparkles, Navigation } from 'lucide-react';

export default function Vehicle3DCanvas({
  tires = {},
  selectedTireId,
  onSelectTire
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const wheelMeshesRef = useRef({});
  const pulseRingsRef = useRef({});
  const animFrameIdRef = useRef(null);

  const [autoRotate, setAutoRotate] = useState(false);
  const [hoveredTire, setHoveredTire] = useState(null);

  // Status-to-color mapping taking into account tire status and thermal anomalies
  const getTireColor = useCallback((tire) => {
    if (!tire) return { hex: 0x00e5ff, str: '#00e5ff' };
    const temp = typeof tire.temperature === 'number'
      ? tire.temperature
      : (typeof tire.physical_temperature === 'number' ? tire.physical_temperature : 32);
    if (tire.status === 'CRITICAL' || temp >= 70) return { hex: 0xef4444, str: '#ef4444' };
    if (temp >= 50) return { hex: 0xf97316, str: '#f97316' };
    if (tire.status === 'WARNING') return { hex: 0xf59e0b, str: '#f59e0b' };
    if (temp <= 0) return { hex: 0x06b6d4, str: '#06b6d4' };
    return { hex: 0x00e5ff, str: '#00e5ff' };
  }, []);

  // Preset camera angle transitions
  const setCameraView = (view) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    switch (view) {
      case 'iso':
        camera.position.set(6.0, 3.8, 6.0);
        controls.target.set(0, 0.3, 0);
        break;
      case 'front':
        camera.position.set(0, 1.8, 7.5);
        controls.target.set(0, 0.4, 0);
        break;
      case 'side':
        camera.position.set(8.5, 1.6, 0);
        controls.target.set(0, 0.4, 0);
        break;
      case 'top':
        camera.position.set(0.1, 9.5, 0.1);
        controls.target.set(0, 0, 0);
        break;
      case 'rear':
        camera.position.set(0, 1.8, -7.5);
        controls.target.set(0, 0.4, 0);
        break;
      default:
        camera.position.set(6.0, 3.8, 6.0);
        controls.target.set(0, 0.3, 0);
    }
    controls.update();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.045);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(6.2, 3.6, 6.2);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't go below floor
    controls.minDistance = 3.5;
    controls.maxDistance = 14;
    controls.target.set(0, 0.35, 0);
    controlsRef.current = controls;

    // 5. Lighting
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x22183b, 1.6);
    scene.add(ambientLight);

    // Main Key Light (Electric Cyan)
    const keyLight = new THREE.DirectionalLight(0x06b6d4, 2.4);
    keyLight.position.set(6, 9, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Fill Light (Neon Violet/Purple)
    const fillLight = new THREE.DirectionalLight(0xa855f7, 2.0);
    fillLight.position.set(-6, 7, -6);
    scene.add(fillLight);

    // Rear rim light
    const rimLight = new THREE.DirectionalLight(0xec4899, 1.2);
    rimLight.position.set(0, 5, -8);
    scene.add(rimLight);

    // Purple underglow pointlight
    const underglow = new THREE.PointLight(0xa855f7, 4.0, 7);
    underglow.position.set(0, 0.15, 0);
    scene.add(underglow);

    // 6. Studio Floor & Cyber Grid
    const grid = new THREE.GridHelper(24, 32, 0xa855f7, 0x1e153b);
    grid.position.y = 0.001;
    scene.add(grid);

    // Circular neon platform under vehicle
    const platformGeo = new THREE.RingGeometry(2.2, 2.26, 64);
    const platformMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = 0.005;
    scene.add(platform);

    const outerPlatformGeo = new THREE.RingGeometry(3.6, 3.63, 64);
    const outerPlatformMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const outerPlatform = new THREE.Mesh(outerPlatformGeo, outerPlatformMat);
    outerPlatform.rotation.x = -Math.PI / 2;
    outerPlatform.position.y = 0.005;
    scene.add(outerPlatform);

    // 7. Vehicle Geometry Construction
    const carGroup = new THREE.Group();
    carGroup.position.y = 0.42;
    scene.add(carGroup);

    // Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x12141d,
      metalness: 0.88,
      roughness: 0.22,
    });

    const bodyAccentMat = new THREE.MeshStandardMaterial({
      color: 0x22183b,
      metalness: 0.95,
      roughness: 0.15,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x090c16,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.88,
      reflectivity: 1.0,
      clearcoat: 1.0,
    });

    const headlightMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1e46 });

    // Lower Chassis
    const lowerBodyGeo = new THREE.BoxGeometry(1.9, 0.48, 4.5);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyMaterial);
    lowerBody.position.y = 0.22;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    carGroup.add(lowerBody);

    // Hood & Trunk sculpted tapers
    const hoodGeo = new THREE.BoxGeometry(1.84, 0.36, 1.4);
    const hood = new THREE.Mesh(hoodGeo, bodyMaterial);
    hood.position.set(0, 0.28, 1.4);
    hood.rotation.x = 0.05;
    carGroup.add(hood);

    const trunkGeo = new THREE.BoxGeometry(1.84, 0.4, 1.2);
    const trunk = new THREE.Mesh(trunkGeo, bodyMaterial);
    trunk.position.set(0, 0.32, -1.5);
    carGroup.add(trunk);

    // Cabin Greenhouse
    const cabinGeo = new THREE.BoxGeometry(1.58, 0.65, 2.1);
    const cabin = new THREE.Mesh(cabinGeo, glassMaterial);
    cabin.position.set(0, 0.68, -0.05);
    carGroup.add(cabin);

    // Roof panel
    const roofGeo = new THREE.BoxGeometry(1.52, 0.06, 1.85);
    const roof = new THREE.Mesh(roofGeo, bodyAccentMat);
    roof.position.set(0, 1.02, -0.05);
    carGroup.add(roof);

    // Headlights (Dual LED clusters)
    const hlGeo = new THREE.BoxGeometry(0.38, 0.08, 0.06);
    const leftHl = new THREE.Mesh(hlGeo, headlightMat);
    leftHl.position.set(0.65, 0.36, 2.26);
    carGroup.add(leftHl);

    const rightHl = new THREE.Mesh(hlGeo, headlightMat);
    rightHl.position.set(-0.65, 0.36, 2.26);
    carGroup.add(rightHl);

    // Taillight continuous LED bar
    const tlGeo = new THREE.BoxGeometry(1.68, 0.07, 0.06);
    const tl = new THREE.Mesh(tlGeo, taillightMat);
    tl.position.set(0, 0.42, -2.26);
    carGroup.add(tl);

    // Side mirrors
    const mirrorGeo = new THREE.BoxGeometry(0.24, 0.12, 0.14);
    const leftMirror = new THREE.Mesh(mirrorGeo, bodyMaterial);
    leftMirror.position.set(0.98, 0.66, 0.72);
    carGroup.add(leftMirror);

    const rightMirror = new THREE.Mesh(mirrorGeo, bodyMaterial);
    rightMirror.position.set(-0.98, 0.66, 0.72);
    carGroup.add(rightMirror);

    // 8. Build 4 Interactive Wheels (FL, FR, RL, RR)
    // Wheel positions relative to car center (Z forward = front of car)
    // Left side of car = -X, Right side of car = +X
    // Front = +Z, Rear = -Z
    const wheelConfigs = [
      { id: 'FL', name: 'Front Left', pos: [-1.02, 0, 1.35] },
      { id: 'FR', name: 'Front Right', pos: [1.02, 0, 1.35] },
      { id: 'RL', name: 'Rear Left', pos: [-1.02, 0, -1.35] },
      { id: 'RR', name: 'Rear Right', pos: [1.02, 0, -1.35] },
    ];

    const tireRubberMat = new THREE.MeshStandardMaterial({
      color: 0x14161a,
      roughness: 0.85,
      metalness: 0.1,
    });

    const rimMetalMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.95,
      roughness: 0.18,
    });

    wheelConfigs.forEach(({ id, pos }) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(...pos);
      wheelGroup.name = `WHEEL_${id}`;
      wheelGroup.userData = { tireId: id };

      // Tire Rubber Cylinder (oriented along X axis)
      const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 32);
      const tireMesh = new THREE.Mesh(tireGeo, tireRubberMat);
      tireMesh.rotation.z = Math.PI / 2;
      tireMesh.castShadow = true;
      tireMesh.userData = { tireId: id };
      wheelGroup.add(tireMesh);

      // Alloy Rim Inner Cylinder
      const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.29, 24);
      const rimMesh = new THREE.Mesh(rimGeo, rimMetalMat);
      rimMesh.rotation.z = Math.PI / 2;
      rimMesh.userData = { tireId: id };
      wheelGroup.add(rimMesh);

      // Glowing Neon Rim Ring (Outer rim border)
      const rimRingGeo = new THREE.TorusGeometry(0.32, 0.024, 16, 32);
      const initialColor = getTireColor(tires[id]);
      const rimGlowMat = new THREE.MeshBasicMaterial({
        color: initialColor.hex,
        transparent: true,
        opacity: 0.95
      });
      const rimRing = new THREE.Mesh(rimRingGeo, rimGlowMat);
      rimRing.rotation.y = Math.PI / 2;
      rimRing.userData = { tireId: id, isGlowRing: true };
      wheelGroup.add(rimRing);

      // Holographic floor pulse ring under wheel contact patch
      const floorPulseGeo = new THREE.RingGeometry(0.25, 0.52, 32);
      const floorPulseMat = new THREE.MeshBasicMaterial({
        color: initialColor.hex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const floorPulse = new THREE.Mesh(floorPulseGeo, floorPulseMat);
      floorPulse.rotation.x = -Math.PI / 2;
      floorPulse.position.set(pos[0], 0.006, pos[2]);
      scene.add(floorPulse);

      carGroup.add(wheelGroup);

      wheelMeshesRef.current[id] = {
        group: wheelGroup,
        glowRing: rimRing,
        glowMat: rimGlowMat,
      };
      pulseRingsRef.current[id] = floorPulse;
    });

    // 9. Raycasting for interactive wheel clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(carGroup.children, true);

      if (intersects.length > 0) {
        // Look for wheel in clicked object hierarchy
        for (let hit of intersects) {
          const tid = hit.object.userData?.tireId;
          if (tid) {
            onSelectTire(tid);
            break;
          }
        }
      }
    };

    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(carGroup.children, true);

      let found = null;
      for (let hit of intersects) {
        const tid = hit.object.userData?.tireId;
        if (tid) {
          found = tid;
          break;
        }
      }
      setHoveredTire(found);
      renderer.domElement.style.cursor = found ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w && h) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 11. Animation render loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Auto-rotation handling
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 1.4;
        controlsRef.current.update();
      }

      // Pulse ring animations
      Object.entries(pulseRingsRef.current).forEach(([tid, ringMesh]) => {
        const tire = tires[tid];
        const isCrit = tire?.status === 'CRITICAL';
        const isWarn = tire?.status === 'WARNING';
        const freq = isCrit ? 6.0 : isWarn ? 3.5 : 1.8;
        const scale = 1.0 + Math.sin(elapsed * freq) * (isCrit ? 0.24 : 0.12);
        ringMesh.scale.set(scale, scale, 1);
        ringMesh.material.opacity = (0.3 + Math.sin(elapsed * freq) * 0.25) * (isCrit ? 1.5 : 1.0);
      });

      // Subtle underglow breathing
      underglow.intensity = 3.6 + Math.sin(elapsed * 2.0) * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // Run on mount

  // Update dynamic wheel colors when tire statuses change or when autoRotate changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    Object.entries(wheelMeshesRef.current).forEach(([tid, wheel]) => {
      const tire = tires[tid];
      const colorInfo = getTireColor(tire);
      const isSelected = selectedTireId === tid;

      if (wheel.glowMat) {
        wheel.glowMat.color.setHex(isSelected ? 0xffffff : colorInfo.hex);
      }

      const pulseRing = pulseRingsRef.current[tid];
      if (pulseRing) {
        pulseRing.material.color.setHex(colorInfo.hex);
      }
    });
  }, [tires, selectedTireId, getTireColor]);

  return (
    <div className="relative w-full aspect-[16/9] flex items-center justify-center overflow-hidden rounded-xl bg-[#07090e]">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full select-none" />

      {/* Floating 360 Rotation Control Toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-purple-500/30 p-1 rounded-xl z-20">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            autoRotate
              ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle 360° Auto-Turntable Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">360° Auto</span>
        </button>

        <button
          onClick={() => setCameraView('iso')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset to 3/4 Isometric View"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Camera Angle Quick Presets */}
      <div className="absolute top-3 left-3 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-purple-500/30 p-1 rounded-xl z-20 text-[10px] font-mono-val">
        <span className="text-purple-400 px-1.5 font-bold uppercase tracking-wider font-tech flex items-center gap-1">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline">Angle:</span>
        </span>
        {[
          { id: 'iso', label: 'Iso' },
          { id: 'front', label: 'Front' },
          { id: 'side', label: 'Side' },
          { id: 'top', label: 'Top' },
          { id: 'rear', label: 'Rear' },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setCameraView(v.id)}
            className="px-2 py-0.5 rounded-md text-slate-400 hover:text-white hover:bg-purple-600/30 transition-all font-semibold"
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Hovered / Click Wheel Indicator */}
      {hoveredTire && (
        <div className="absolute bottom-11 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/50 text-cyan-300 text-xs font-bold font-tech shadow-[0_0_12px_#06b6d4] animate-fadeIn pointer-events-none z-20">
          Click to inspect Wheel {hoveredTire} ({tires[hoveredTire]?.position})
        </div>
      )}

      {/* Bottom HUD Hint Bar */}
      <div className="absolute bottom-2 inset-x-3 py-1.5 px-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-purple-500/20 flex items-center justify-between text-[10px] text-slate-300 z-10">
        <span className="flex items-center gap-1.5 text-purple-300 font-semibold font-tech">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>360° Real-Time 3D Digital Twin</span>
        </span>
        <span className="text-slate-400 font-mono-val hidden sm:inline">
          Drag to rotate 360° • Scroll to zoom • Click any wheel to inspect
        </span>
      </div>
    </div>
  );
}
