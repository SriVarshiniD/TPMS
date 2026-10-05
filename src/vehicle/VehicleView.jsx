import React, { useState } from 'react';
import TireCallout from './TireCallout';
import MercedesStudioViewer from './MercedesStudioViewer';
import Vehicle3DCanvas from './Vehicle3DCanvas';
import { Layers, Eye, RotateCw, Sparkles, Compass, Box } from 'lucide-react';

export default function VehicleView({ tires = {}, selectedTireId, onSelectTire, affectedTireId }) {
  // Default to the photorealistic Mercedes-Benz E-Class Cyber Studio with 360° Turntable!
  const [viewMode, setViewMode] = useState('studio'); // 'studio' | 'blueprint' | '3d'

  const fl = tires?.FL;
  const fr = tires?.FR;
  const rl = tires?.RL;
  const rr = tires?.RR;

  return (
    <div className="relative w-full rounded-2xl glass-panel p-4 lg:p-6 overflow-hidden flex flex-col justify-between">
      {/* Background cyber radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar of Vehicle Panel */}
      <div className="relative z-10 flex flex-wrap items-center justify-between pb-3 border-b border-purple-500/20 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
          <h2 className="text-xs lg:text-sm font-bold tracking-wider uppercase text-slate-100 font-tech">
            Vehicle Digital Twin Visualization
          </h2>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Mercedes-Benz E-Class Architecture Reference
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-purple-500/30 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'studio'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-300" />
            <span>Mercedes-Benz 360° Studio</span>
          </button>
          <button
            onClick={() => setViewMode('blueprint')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'blueprint'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chassis Blueprint</span>
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === '3d'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Mesh Model</span>
          </button>
        </div>
      </div>

      {/* Main Vehicle Showcase Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center min-h-[380px]">
        {/* Left Column: Front Left & Rear Left Callouts */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <TireCallout
            tire={fl}
            isSelected={selectedTireId === 'FL'}
            onClick={() => onSelectTire('FL')}
            isAffected={Boolean(fl?.leak_enabled && fl?.leak_rate > 0)}
          />
          <TireCallout
            tire={rl}
            isSelected={selectedTireId === 'RL'}
            onClick={() => onSelectTire('RL')}
            isAffected={Boolean(rl?.leak_enabled && rl?.leak_rate > 0)}
          />
        </div>

        {/* Center: Vehicle Rendering (Mercedes-Benz 360 Studio, Blueprint, or 3D Mesh) */}
        <div className="lg:col-span-6 relative flex items-center justify-center p-1 rounded-2xl bg-black/40 border border-purple-500/15 overflow-hidden group">
          {viewMode === 'studio' ? (
            /* Photorealistic Mercedes-Benz E-Class with 360° Drag Turntable & Interactive Hotspots */
            <MercedesStudioViewer
              tires={tires}
              selectedTireId={selectedTireId}
              onSelectTire={onSelectTire}
            />
          ) : viewMode === 'blueprint' ? (
            /* Top-Down Architectural Blueprint Chassis SVG */
            <div className="relative w-full aspect-[16/9] flex items-center justify-center p-4 bg-[#080a12] rounded-xl border border-cyan-500/20">
              <svg viewBox="0 0 600 350" className="w-full h-full max-h-[300px]">
                {/* Chassis Outline */}
                <path
                  d="M170 110 C210 90, 390 90, 430 110 C460 125, 470 175, 470 175 C470 175, 460 225, 430 240 C390 260, 210 260, 170 240 C140 225, 130 175, 130 175 C130 175, 140 125, 170 110 Z"
                  fill="rgba(168, 85, 247, 0.05)"
                  stroke="rgba(168, 85, 247, 0.5)"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Axle Lines */}
                <line x1="180" y1="50" x2="180" y2="300" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="420" y1="50" x2="420" y2="300" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="180" y1="175" x2="420" y2="175" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1.5" />

                {/* Tire FL (Front Left) */}
                <g onClick={() => onSelectTire('FL')} className="cursor-pointer">
                  <rect
                    x="155" y="45" width="54" height="32" rx="6"
                    fill={fl?.status === 'CRITICAL' || fl?.physical_temperature >= 70 ? '#ef4444' : fl?.status === 'WARNING' || fl?.physical_temperature >= 50 ? '#f59e0b' : '#3b82f6'}
                    fillOpacity="0.45"
                    stroke={fl?.status === 'CRITICAL' || fl?.physical_temperature >= 70 ? '#ef4444' : fl?.status === 'WARNING' || fl?.physical_temperature >= 50 ? '#f59e0b' : '#06b6d4'}
                    strokeWidth="2"
                  />
                  <text x="182" y="59" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">FL</text>
                  <text x="182" y="70" textAnchor="middle" fill={fl?.physical_temperature >= 70 ? '#f97316' : '#cbd5e1'} fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                    {fl?.physical_temperature >= 70 ? 'OVERHEAT' : fl?.leak_enabled && fl?.leak_rate > 0 ? 'LEAK' : fl?.physical_temperature >= 50 ? 'WARM' : `${fl?.current_pressure?.toFixed(0) ?? '--'} PSI`}
                  </text>
                </g>

                {/* Tire FR (Front Right) */}
                <g onClick={() => onSelectTire('FR')} className="cursor-pointer">
                  <rect
                    x="155" y="275" width="54" height="32" rx="6"
                    fill={fr?.status === 'CRITICAL' || fr?.physical_temperature >= 70 ? '#ef4444' : fr?.status === 'WARNING' || fr?.physical_temperature >= 50 ? '#f59e0b' : '#3b82f6'}
                    fillOpacity="0.45"
                    stroke={fr?.status === 'CRITICAL' || fr?.physical_temperature >= 70 ? '#ef4444' : fr?.status === 'WARNING' || fr?.physical_temperature >= 50 ? '#f59e0b' : '#06b6d4'}
                    strokeWidth="2"
                  />
                  <text x="182" y="289" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">FR</text>
                  <text x="182" y="300" textAnchor="middle" fill={fr?.physical_temperature >= 70 ? '#f97316' : '#cbd5e1'} fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                    {fr?.physical_temperature >= 70 ? 'OVERHEAT' : fr?.leak_enabled && fr?.leak_rate > 0 ? 'LEAK' : fr?.physical_temperature >= 50 ? 'WARM' : `${fr?.current_pressure?.toFixed(0) ?? '--'} PSI`}
                  </text>
                </g>

                {/* Tire RL (Rear Left) */}
                <g onClick={() => onSelectTire('RL')} className="cursor-pointer">
                  <rect
                    x="395" y="45" width="54" height="32" rx="6"
                    fill={rl?.status === 'CRITICAL' || rl?.physical_temperature >= 70 ? '#ef4444' : rl?.status === 'WARNING' || rl?.physical_temperature >= 50 ? '#f59e0b' : '#a855f7'}
                    fillOpacity="0.45"
                    stroke={rl?.status === 'CRITICAL' || rl?.physical_temperature >= 70 ? '#ef4444' : rl?.status === 'WARNING' || rl?.physical_temperature >= 50 ? '#f59e0b' : '#a855f7'}
                    strokeWidth="2"
                  />
                  <text x="422" y="59" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">RL</text>
                  <text x="422" y="70" textAnchor="middle" fill={rl?.physical_temperature >= 70 ? '#f97316' : '#cbd5e1'} fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                    {rl?.physical_temperature >= 70 ? 'OVERHEAT' : rl?.leak_enabled && rl?.leak_rate > 0 ? 'LEAK' : rl?.physical_temperature >= 50 ? 'WARM' : `${rl?.current_pressure?.toFixed(0) ?? '--'} PSI`}
                  </text>
                </g>

                {/* Tire RR (Rear Right) */}
                <g onClick={() => onSelectTire('RR')} className="cursor-pointer">
                  <rect
                    x="395" y="275" width="54" height="32" rx="6"
                    fill={rr?.status === 'CRITICAL' || rr?.physical_temperature >= 70 ? '#ef4444' : rr?.status === 'WARNING' || rr?.physical_temperature >= 50 ? '#f59e0b' : '#a855f7'}
                    fillOpacity="0.45"
                    stroke={rr?.status === 'CRITICAL' || rr?.physical_temperature >= 70 ? '#ef4444' : rr?.status === 'WARNING' || rr?.physical_temperature >= 50 ? '#f59e0b' : '#a855f7'}
                    strokeWidth="2"
                  />
                  <text x="422" y="289" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">RR</text>
                  <text x="422" y="300" textAnchor="middle" fill={rr?.physical_temperature >= 70 ? '#f97316' : '#cbd5e1'} fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                    {rr?.physical_temperature >= 70 ? 'OVERHEAT' : rr?.leak_enabled && rr?.leak_rate > 0 ? 'LEAK' : rr?.physical_temperature >= 50 ? 'WARM' : `${rr?.current_pressure?.toFixed(0) ?? '--'} PSI`}
                  </text>
                </g>

                {/* Center SDV ECU Node */}
                <circle cx="300" cy="175" r="22" fill="#1e163d" stroke="#a855f7" strokeWidth="2" />
                <text x="300" y="179" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="bold">SDV ECU</text>

                {/* Direction Indicator */}
                <polygon points="120,175 140,165 140,185" fill="#06b6d4" />
                <text x="80" y="179" fill="#06b6d4" fontSize="10" fontWeight="bold">FRONT</text>
              </svg>
            </div>
          ) : (
            /* 3D Mesh Canvas Model */
            <Vehicle3DCanvas
              tires={tires}
              selectedTireId={selectedTireId}
              onSelectTire={onSelectTire}
            />
          )}
        </div>

        {/* Right Column: Front Right & Rear Right Callouts */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <TireCallout
            tire={fr}
            isSelected={selectedTireId === 'FR'}
            onClick={() => onSelectTire('FR')}
            isAffected={Boolean(fr?.leak_enabled && fr?.leak_rate > 0)}
          />
          <TireCallout
            tire={rr}
            isSelected={selectedTireId === 'RR'}
            onClick={() => onSelectTire('RR')}
            isAffected={Boolean(rr?.leak_enabled && rr?.leak_rate > 0)}
          />
        </div>
      </div>
    </div>
  );
}
