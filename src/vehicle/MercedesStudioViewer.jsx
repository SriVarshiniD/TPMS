import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Sparkles, Navigation, Layers, Compass } from 'lucide-react';

const ANGLES = [
  {
    id: 'iso',
    name: 'Isometric 3/4',
    src: '/vehicle_studio.jpg',
    pins: {
      FL: { left: '41%', top: '76%', label: 'FL' },
      FR: { left: '24%', top: '57%', label: 'FR' },
      RL: { left: '72%', top: '58%', label: 'RL' },
      RR: { left: '67%', top: '34%', label: 'RR' },
    }
  },
  {
    id: 'front',
    name: 'Front 3/4',
    src: '/vehicle_studio_front.jpg',
    pins: {
      FL: { left: '46%', top: '65%', label: 'FL' },
      FR: { left: '24%', top: '52%', label: 'FR' },
      RL: { left: '76%', top: '48%', label: 'RL' },
      RR: { left: '80%', top: '32%', label: 'RR' },
    }
  },
  {
    id: 'side',
    name: 'Side Profile',
    src: '/vehicle_studio_side.jpg',
    pins: {
      FL: { left: '27%', top: '60%', label: 'FL' },
      RL: { left: '74%', top: '58%', label: 'RL' },
    }
  },
  {
    id: 'rear',
    name: 'Rear 3/4',
    src: '/vehicle_studio_rear.jpg',
    pins: {
      RL: { left: '46%', top: '65%', label: 'RL' },
      RR: { left: '26%', top: '48%', label: 'RR' },
      FL: { left: '73%', top: '50%', label: 'FL' },
      FR: { left: '76%', top: '36%', label: 'FR' },
    }
  }
];

export default function MercedesStudioViewer({ tires = {}, selectedTireId, onSelectTire }) {
  const [currentAngleIdx, setCurrentAngleIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const currentAngle = ANGLES[currentAngleIdx];

  // Auto-rotation timer
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setCurrentAngleIdx((prev) => (prev + 1) % ANGLES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Drag-to-rotate handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    // 3D Parallax tilt
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8; // -4 to +4 deg
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6; // -3 to +3 deg
      setTilt({ x, y });
    }

    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    const threshold = 65; // pixels dragged to change angle
    if (deltaX > threshold) {
      setCurrentAngleIdx((prev) => (prev + 1) % ANGLES.length);
      setDragStartX(e.clientX);
    } else if (deltaX < -threshold) {
      setCurrentAngleIdx((prev) => (prev - 1 + ANGLES.length) % ANGLES.length);
      setDragStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setTilt({ x: 0, y: 0 });
  };

  const getHotspotClass = (tire) => {
    if (!tire) return 'border-cyan-400 bg-cyan-400/40';
    const isOffline = tire.sensor_status === 'OFFLINE' || tire.sensor_status === 'STALE';
    if (isOffline) {
      return 'border-red-500 bg-red-500/40 shadow-[0_0_16px_#ef4444] animate-pulse';
    }
    const temp = typeof tire.temperature === 'number'
      ? tire.temperature
      : (typeof tire.physical_temperature === 'number' ? tire.physical_temperature : 32);
    const isOverheating = temp >= 70;
    const isHighTemp = temp >= 50;
    const isSubZero = temp <= 0;
    const hasLeak = Boolean(tire.leak_enabled && tire.leak_rate > 0);

    if (tire.status === 'CRITICAL' || isOverheating) {
      return 'border-red-500 bg-red-500 shadow-[0_0_20px_#ef4444] animate-ping-slow';
    }
    if (isHighTemp) {
      return 'border-orange-500 bg-orange-500 shadow-[0_0_18px_#ea580c] animate-pulse';
    }
    if (tire.status === 'WARNING' || hasLeak) {
      return 'border-amber-400 bg-amber-400 shadow-[0_0_18px_#f59e0b] animate-pulse';
    }
    if (isSubZero) {
      return 'border-cyan-400 bg-cyan-400 shadow-[0_0_18px_#0891b2] animate-pulse';
    }
    return 'border-cyan-400 bg-cyan-400 shadow-[0_0_12px_#06b6d4]';
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-[16/9] flex items-center justify-center overflow-hidden rounded-xl bg-black/60 select-none cursor-grab active:cursor-grabbing group"
      style={{
        perspective: '1000px',
      }}
    >
      {/* 3D Parallax Tilt Container */}
      <div
        className="w-full h-full relative transition-transform duration-200 ease-out"
        style={{
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        }}
      >
        {/* Photorealistic Mercedes-Benz E-Class image */}
        <img
          src={currentAngle.src}
          alt={`Mercedes-Benz E-Class - ${currentAngle.name}`}
          className="w-full h-full object-cover object-center brightness-95 transition-opacity duration-300"
          draggable={false}
        />

        {/* Holographic Radar Scanner Sweep Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent pointer-events-none animate-radar-scan opacity-60" />

        {/* Dynamic Interactive Wheel Hotspot Pins */}
        {Object.entries(currentAngle.pins).map(([tid, pin]) => {
          const tire = tires?.[tid];
          const isSelected = selectedTireId === tid;
          const isOffline = tire?.sensor_status === 'OFFLINE' || tire?.sensor_status === 'STALE';
          const temp = typeof tire?.temperature === 'number'
            ? tire.temperature
            : (typeof tire?.physical_temperature === 'number' ? tire.physical_temperature : null);
          const isOverheating = temp !== null && temp >= 70;
          const isHighTemp = temp !== null && temp >= 50 && temp < 70;
          const isSubZero = temp !== null && temp <= 0;
          const hasLeak = Boolean(tire?.leak_enabled && tire?.leak_rate > 0);

          return (
            <button
              key={tid}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTire(tid);
              }}
              style={{ left: pin.left, top: pin.top }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group/pin z-20 cursor-pointer"
            >
              <span
                className={`w-4 h-4 rounded-full border-2 ${getHotspotClass(tire)} transition-all ${
                  isSelected ? 'scale-125 ring-2 ring-purple-400' : 'group-hover/pin:scale-125'
                }`}
              />
              <span className="absolute -top-7 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/95 text-white border border-purple-500/40 pointer-events-none shadow-lg whitespace-nowrap flex items-center gap-1">
                <span className="text-purple-300">{tid}</span>
                <span>{isOffline ? '-- PSI' : `${tire?.current_pressure?.toFixed(1) ?? '34.0'} PSI`}</span>
                {!isOffline && hasLeak && (
                  <span className="px-1 py-0.2 rounded bg-red-600 text-white font-mono text-[8px] animate-pulse">LEAK</span>
                )}
                {!isOffline && isOverheating && (
                  <span className="px-1 py-0.2 rounded bg-orange-600 text-white font-mono text-[8px] animate-pulse">HOT {temp.toFixed(0)}°</span>
                )}
                {!isOffline && isHighTemp && (
                  <span className="px-1 py-0.2 rounded bg-amber-600 text-white font-mono text-[8px]">WARM {temp.toFixed(0)}°</span>
                )}
                {!isOffline && isSubZero && (
                  <span className="px-1 py-0.2 rounded bg-cyan-600 text-white font-mono text-[8px]">COLD {temp.toFixed(0)}°</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Top Controls: 360 Turntable Auto & Angle Presets */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-auto">
        {/* Angle Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-purple-500/30 p-1 rounded-xl text-[10px] font-mono-val">
          <span className="text-purple-400 px-1.5 font-bold uppercase tracking-wider font-tech flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">360° Angle:</span>
          </span>
          {ANGLES.map((angle, idx) => (
            <button
              key={angle.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentAngleIdx(idx);
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                currentAngleIdx === idx
                  ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {angle.name}
            </button>
          ))}
        </div>

        {/* 360° Auto-Turntable Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAutoRotate(!autoRotate);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
            autoRotate
              ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
              : 'bg-slate-950/85 border-purple-500/30 text-slate-300 hover:text-white'
          }`}
          title="Toggle 360° Turntable Angle Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>{autoRotate ? 'Auto-Rotating' : '360° Auto'}</span>
        </button>
      </div>

      {/* Bottom HUD Hint Bar */}
      <div className="absolute bottom-2 inset-x-3 py-1.5 px-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-purple-500/20 flex items-center justify-between text-[10px] text-slate-300 z-10 pointer-events-none">
        <span className="flex items-center gap-1.5 text-purple-300 font-semibold font-tech">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Mercedes-Benz E-Class Digital Twin • {currentAngle.name}</span>
        </span>
        <span className="text-slate-400 font-mono-val hidden sm:inline">
          Drag horizontally to rotate 360° • Click any wheel node to inspect
        </span>
      </div>
    </div>
  );
}
