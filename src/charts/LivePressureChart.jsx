import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { Activity, Clock, Sliders, WifiOff } from 'lucide-react';

// Custom dark futuristic tooltip for Recharts
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[#0b0e1b]/95 border border-purple-500/30 backdrop-blur-md shadow-2xl text-xs space-y-1.5 font-mono-val">
        <div className="text-[11px] font-bold text-purple-300 pb-1 border-b border-purple-500/20 flex items-center justify-between gap-4">
          <span>Simulation Time: {label}</span>
        </div>
        {payload.map((entry, index) => {
          if (entry.name === 'warning' || entry.name === 'critical') return null;
          const isValueNull = entry.value === null || entry.value === undefined;
          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              {isValueNull ? (
                <span className="font-bold text-red-400 flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  <span>OFFLINE</span>
                </span>
              ) : (
                <span className="font-bold text-white">{Number(entry.value).toFixed(2)} PSI</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

export default function LivePressureChart({ 
  history, 
  warningThreshold = 30.6, 
  criticalThreshold = 27.2, 
  nominalPressure = 34.0, 
  isLive = true,
  tires = {}
}) {
  const isFlLeaking = Boolean(tires?.FL?.leak_enabled && tires?.FL?.leak_rate > 0);
  const isFrLeaking = Boolean(tires?.FR?.leak_enabled && tires?.FR?.leak_rate > 0);
  const isRlLeaking = Boolean(tires?.RL?.leak_enabled && tires?.RL?.leak_rate > 0);
  const isRrLeaking = Boolean(tires?.RR?.leak_enabled && tires?.RR?.leak_rate > 0);

  const isFlOffline = tires?.FL?.sensor_status === 'OFFLINE';
  const isFrOffline = tires?.FR?.sensor_status === 'OFFLINE';
  const isRlOffline = tires?.RL?.sensor_status === 'OFFLINE';
  const isRrOffline = tires?.RR?.sensor_status === 'OFFLINE';

  const anyOffline = isFlOffline || isFrOffline || isRlOffline || isRrOffline;
  const offlineNames = [
    isFlOffline && 'FL',
    isFrOffline && 'FR',
    isRlOffline && 'RL',
    isRrOffline && 'RR',
  ].filter(Boolean).join(', ');

  // Compute nice Y-domain
  const yMin = Math.max(15, Math.floor(criticalThreshold - 4));
  const yMax = Math.ceil(nominalPressure + 4);

  return (
    <div className="w-full rounded-2xl glass-panel p-4 lg:p-5 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs lg:text-sm font-bold tracking-wider uppercase text-white font-tech">
            Real-Time Pressure Telemetry Streams
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Threshold Legend Badges */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono-val">
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-3 h-0.5 border-t border-dashed border-amber-400" />
              <span>Warning: {warningThreshold.toFixed(1)} PSI</span>
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-3 h-0.5 border-t border-dashed border-red-400" />
              <span>Critical: {criticalThreshold.toFixed(1)} PSI</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[10px] text-purple-300 font-bold uppercase">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping-slow' : 'bg-amber-400'}`} />
            <span>{isLive ? 'STREAMING' : 'PAUSED'}</span>
          </div>
        </div>
      </div>

      {/* Offline Sensor Notice Banner (Requirement 14) */}
      {anyOffline && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-[11px] text-red-300 flex items-center justify-between font-mono-val animate-fadeIn">
          <span className="flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
            <span>Telemetry link offline on: <strong className="text-red-200">{offlineNames}</strong> (Plotting suspended — no fabricated data)</span>
          </span>
          <span className="text-[10px] text-slate-400">P_sensor = UNKNOWN</span>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.08)" />

            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'rgba(168, 85, 247, 0.2)' }}
            />

            <YAxis
              domain={[yMin, yMax]}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'rgba(168, 85, 247, 0.2)' }}
              tickFormatter={(v) => `${v}`}
              unit=" PSI"
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ paddingTop: '8px', fontSize: '11px', fontWeight: '600' }}
              iconType="circle"
            />

            {/* Threshold Reference Lines */}
            <ReferenceLine
              y={warningThreshold}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Warning (${warningThreshold} PSI)`,
                fill: '#f59e0b',
                fontSize: 9,
                position: 'insideTopRight'
              }}
            />

            <ReferenceLine
              y={criticalThreshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Critical (${criticalThreshold} PSI)`,
                fill: '#ef4444',
                fontSize: 9,
                position: 'insideBottomRight'
              }}
            />

            {/* 4 Tire Telemetry Curves (connectNulls=false to show dropout gaps) */}
            {/* Front Left - Cyan */}
            <Line
              type="monotone"
              dataKey="FL"
              name={`FL${isFlOffline ? ' [OFFLINE]' : isFlLeaking ? ' [Leaking]' : ''}`}
              stroke={isFlOffline ? '#64748b' : isFlLeaking ? '#ec4899' : '#06b6d4'}
              strokeWidth={isFlLeaking ? 2.5 : 2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* Front Right - Electric Blue */}
            <Line
              type="monotone"
              dataKey="FR"
              name={`FR${isFrOffline ? ' [OFFLINE]' : isFrLeaking ? ' [Leaking]' : ''}`}
              stroke={isFrOffline ? '#64748b' : isFrLeaking ? '#ec4899' : '#3b82f6'}
              strokeWidth={isFrLeaking ? 2.5 : 2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* Rear Left - Neon Violet */}
            <Line
              type="monotone"
              dataKey="RL"
              name={`RL${isRlOffline ? ' [OFFLINE]' : isRlLeaking ? ' [Leaking]' : ''}`}
              stroke={isRlOffline ? '#64748b' : isRlLeaking ? '#ec4899' : '#a855f7'}
              strokeWidth={isRlLeaking ? 2.5 : 2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* Rear Right - Purple */}
            <Line
              type="monotone"
              dataKey="RR"
              name={`RR${isRrOffline ? ' [OFFLINE]' : isRrLeaking ? ' [Leaking]' : ''}`}
              stroke={isRrOffline ? '#64748b' : isRrLeaking ? '#ec4899' : '#8b5cf6'}
              strokeWidth={isRrLeaking ? 2.5 : 2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with formula reference */}
      <div className="mt-2 pt-2 border-t border-purple-500/10 flex items-center justify-between text-[10px] text-slate-400 font-mono-val">
        <span>Ideal Gas Model: P(T) = P₀·(T/T₀) - r·t + 𝒩(0, σ²)</span>
        <span>Buffer: {history.length} samples</span>
      </div>
    </div>
  );
}
