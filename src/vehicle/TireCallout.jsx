import React from 'react';
import { AlertTriangle, CheckCircle2, Flame, Gauge, WifiOff, Thermometer, Snowflake } from 'lucide-react';

export default function TireCallout({ tire, isSelected, onClick, isAffected }) {
  if (!tire) return null;

  const isOffline = tire.sensor_status === 'OFFLINE' || tire.sensor_status === 'STALE';
  const isCritical = tire.status === 'CRITICAL' && !isOffline;
  const isWarning = tire.status === 'WARNING' && !isOffline;
  const isNormal = tire.status === 'NORMAL' && !isOffline;
  
  // A tire is only actively leaking if leak_enabled is true AND leak_rate > 0
  const hasActiveLeak = Boolean(tire.leak_enabled && tire.leak_rate > 0);

  // Thermal threshold classification
  const temp = typeof tire.temperature === 'number'
    ? tire.temperature
    : (typeof tire.physical_temperature === 'number' ? tire.physical_temperature : null);
  const isOverheating = temp !== null && temp >= 70;
  const isHighTemp = temp !== null && temp >= 50 && temp < 70;
  const isSubZero = temp !== null && temp <= 0;
  const hasAbnormalTemp = isOverheating || isHighTemp || isSubZero;

  // Card theme styling based on tire, sensor status, and thermal extremes
  const cardBorderClass = isOffline
    ? 'border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.45)] bg-[#1e0a0d]/90 ring-1 ring-red-500/30'
    : isCritical || isOverheating
    ? 'border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.4)] bg-[#1e0a0d]/90 ring-1 ring-red-500/20'
    : isWarning || isHighTemp
    ? 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.35)] bg-[#1d1406]/90'
    : isSubZero
    ? 'border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.35)] bg-[#091524]/90'
    : isSelected
    ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)] bg-[#120f26]/90'
    : 'border-purple-500/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-[#0d101e]/85 hover:border-purple-400/50';

  const badgeClass = isOffline
    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
    : isCritical || isOverheating
    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
    : isWarning || isHighTemp
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    : isSubZero
    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  const statusText = isOffline
    ? 'SENSOR FAULT'
    : isCritical
    ? (tire.pressure_status === 'CRITICAL' ? 'CRITICAL LOW' : isOverheating ? 'OVERHEATING' : 'CRITICAL')
    : isWarning
    ? (tire.pressure_status === 'WARNING' ? 'LOW PRESSURE' : isHighTemp ? 'HIGH TEMP' : isSubZero ? 'SUB-ZERO' : 'WARNING')
    : 'NORMAL';

  const pressureTextColor = isOffline
    ? 'text-red-400'
    : isCritical
    ? 'text-red-400 text-glow-critical'
    : isWarning
    ? 'text-amber-400 text-glow-warning'
    : 'text-white';

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 p-3.5 rounded-2xl border backdrop-blur-xl relative group ${cardBorderClass}`}
    >
      {/* Top Banner Badges: Sensor Offline, Leak Active, Abnormal Temperature */}
      <div className="absolute -top-2.5 right-3 flex items-center gap-1.5 flex-wrap justify-end pointer-events-none z-10">
        {/* Sensor Offline Banner Tag */}
        {isOffline && (
          <div className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-red-600 text-white shadow-[0_0_12px_#ef4444] flex items-center gap-1 animate-pulse">
            <WifiOff className="w-2.5 h-2.5" />
            <span>NO RF TELEMETRY</span>
          </div>
        )}

        {/* Leak indicator tag - ONLY shown if this tire is actively leaking */}
        {!isOffline && hasActiveLeak && (
          <div className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-red-600 text-white shadow-[0_0_10px_#ef4444] flex items-center gap-1 animate-pulse">
            <Flame className="w-2.5 h-2.5" />
            <span>LEAK ACTIVE</span>
          </div>
        )}

        {/* Abnormal Temperature Indicator Tag */}
        {!isOffline && hasAbnormalTemp && (
          isOverheating ? (
            <div className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-orange-600 text-white shadow-[0_0_12px_#ea580c] flex items-center gap-1 animate-pulse">
              <Flame className="w-2.5 h-2.5" />
              <span>OVERHEATING ({temp?.toFixed(0)}°C)</span>
            </div>
          ) : isHighTemp ? (
            <div className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-amber-600 text-white shadow-[0_0_10px_#d97706] flex items-center gap-1 animate-pulse">
              <Thermometer className="w-2.5 h-2.5" />
              <span>HIGH TEMP ({temp?.toFixed(0)}°C)</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-cyan-600 text-white shadow-[0_0_10px_#0891b2] flex items-center gap-1 animate-pulse">
              <Snowflake className="w-2.5 h-2.5" />
              <span>SUB-ZERO ({temp?.toFixed(0)}°C)</span>
            </div>
          )
        )}
      </div>

      {/* Header: Position & Status Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-xs font-bold font-tech text-purple-300">
            {tire.id}
          </span>
          <div>
            <div className="text-[11px] font-semibold text-slate-300 leading-tight">
              {tire.position}
            </div>
            <div className={`text-[9px] uppercase font-mono-val ${isOffline ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
              Sensor {tire.sensor_status}
            </div>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border flex items-center gap-1 ${badgeClass}`}>
          {isOffline ? (
            <WifiOff className="w-2.5 h-2.5" />
          ) : isCritical || isOverheating ? (
            <AlertTriangle className="w-2.5 h-2.5" />
          ) : isWarning || isHighTemp || isSubZero ? (
            <AlertTriangle className="w-2.5 h-2.5" />
          ) : (
            <CheckCircle2 className="w-2.5 h-2.5" />
          )}
          <span>{statusText}</span>
        </span>
      </div>

      {/* Metrics Row: Pressure & Temp */}
      <div className="flex items-end justify-between mt-2 pt-2 border-t border-white/5">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <Gauge className="w-3 h-3 text-purple-400" />
            <span>Pressure</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            {isOffline ? (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-telemetry tracking-tight text-red-400 animate-pulse">
                  --
                </span>
                <span className="text-xs text-red-400 font-mono-val font-semibold">PSI</span>
                <span className="text-[9px] text-red-400/80 font-mono-val ml-1">(UNKNOWN)</span>
              </div>
            ) : (
              <>
                <span className={`text-2xl font-black font-telemetry tracking-tight ${pressureTextColor}`}>
                  {typeof tire.current_pressure === 'number' ? tire.current_pressure.toFixed(1) : '--'}
                </span>
                <span className="text-xs text-slate-400 font-semibold font-mono-val">PSI</span>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-end gap-1">
            <Thermometer className="w-3 h-3 text-orange-400" />
            <span>Cavity Temp</span>
          </div>
          <div className={`text-sm font-bold font-mono-val mt-1 flex items-center justify-end gap-1 ${
            isOffline
              ? 'text-red-400/80'
              : isOverheating
              ? 'text-orange-400 font-black animate-pulse drop-shadow-[0_0_8px_#ea580c]'
              : isHighTemp
              ? 'text-amber-400 font-bold drop-shadow-[0_0_6px_#d97706]'
              : isSubZero
              ? 'text-cyan-300 font-bold drop-shadow-[0_0_6px_#0891b2]'
              : 'text-slate-200'
          }`}>
            {isOffline ? (
              <span>-- °C</span>
            ) : (
              <>
                {isOverheating && <Flame className="w-3 h-3 text-orange-400 animate-bounce" />}
                {isHighTemp && <Thermometer className="w-3 h-3 text-amber-400" />}
                {isSubZero && <Snowflake className="w-3 h-3 text-cyan-400" />}
                <span>{typeof temp === 'number' ? `${temp.toFixed(1)}°C` : '-- °C'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mini Pressure Level Progress Bar */}
      <div className="mt-2.5">
        <div className="flex justify-between text-[9px] text-slate-400 mb-1 font-mono-val">
          <span>{isOffline ? 'Telemetry Unavailable' : `${tire.pressure_percentage?.toFixed(0) ?? 100}% nominal`}</span>
          <span>{tire.nominal_pressure} PSI ref</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOffline
                ? 'bg-red-600/50 w-full animate-pulse'
                : isCritical
                ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_8px_#ef4444]'
                : isWarning
                ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_#f59e0b]'
                : 'bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_8px_#06b6d4]'
            }`}
            style={{ width: isOffline ? '100%' : `${Math.min(100, Math.max(5, tire.pressure_percentage ?? 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
