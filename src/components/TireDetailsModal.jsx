import React from 'react';
import { 
  X, 
  CircleDot, 
  Gauge, 
  Thermometer, 
  Flame, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  RefreshCw,
  Clock,
  HeartPulse,
  Snowflake
} from 'lucide-react';

export default function TireDetailsModal({ 
  tire, 
  onClose, 
  onToggleLeak, 
  isAffected,
  onUpdateConfig 
}) {
  if (!tire) return null;

  const isOffline = tire.sensor_status === 'OFFLINE' || tire.sensor_status === 'STALE';
  const isCritical = tire.status === 'CRITICAL' && !isOffline;
  const isWarning = tire.status === 'WARNING' && !isOffline;

  const temp = typeof tire.temperature === 'number'
    ? tire.temperature
    : (typeof tire.physical_temperature === 'number' ? tire.physical_temperature : null);
  const isOverheating = temp !== null && temp >= 70;
  const isHighTemp = temp !== null && temp >= 50 && temp < 70;
  const isSubZero = temp !== null && temp <= 0;
  const hasActiveLeak = Boolean(tire.leak_enabled && tire.leak_rate > 0);

  const statusBg = isOffline
    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
    : isCritical 
    ? 'bg-red-500/20 text-red-300 border-red-500/40' 
    : isWarning 
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  const handleToggleSensor = () => {
    if (onUpdateConfig) {
      onUpdateConfig({ sensor_toggle: tire.id });
    }
  };

  const handleSetTemperature = (tempVal) => {
    if (onUpdateConfig) {
      onUpdateConfig({
        tire_temperatures: { [tire.id]: tempVal }
      });
    }
  };

  const handleResetTemperature = () => {
    if (onUpdateConfig) {
      onUpdateConfig({
        tire_temperatures: { [tire.id]: null }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl glass-panel-purple p-5 lg:p-6 border border-purple-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-purple-500/20">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-base font-bold font-tech text-purple-300">
            {tire.id}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white font-tech">
                TIRE DETAILS — {tire.id} ({tire.position.toUpperCase()})
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBg}`}>
                {tire.status}
              </span>
              {!isOffline && hasActiveLeak && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600 text-white animate-pulse flex items-center gap-1 shadow-[0_0_8px_#ef4444]">
                  <Flame className="w-2.5 h-2.5" />
                  LEAK ACTIVE
                </span>
              )}
              {!isOffline && isOverheating && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-600 text-white animate-pulse flex items-center gap-1 shadow-[0_0_8px_#ea580c]">
                  <Flame className="w-2.5 h-2.5" />
                  OVERHEATING ({temp?.toFixed(0)}°C)
                </span>
              )}
              {!isOffline && isHighTemp && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-600 text-white animate-pulse flex items-center gap-1 shadow-[0_0_8px_#d97706]">
                  <Thermometer className="w-2.5 h-2.5" />
                  HIGH TEMP ({temp?.toFixed(0)}°C)
                </span>
              )}
              {!isOffline && isSubZero && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-600 text-white animate-pulse flex items-center gap-1 shadow-[0_0_8px_#0891b2]">
                  <Snowflake className="w-2.5 h-2.5" />
                  SUB-ZERO ({temp?.toFixed(0)}°C)
                </span>
              )}
            </div>
            <p className="text-xs text-purple-300/70 font-mono-val">
              Digital Twin Transducer: SDV-TPMS-{tire.id}-01
            </p>
          </div>
        </div>

        {/* Primary Telemetry Metrics Grid (Requirement 17) */}
        <div className="grid grid-cols-2 gap-3 py-3">
          {/* Pressure */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-purple-500/20">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pressure</span>
            </div>
            <div className="flex items-baseline gap-1">
              {isOffline ? (
                <span className="text-2xl font-black font-telemetry text-red-400 tracking-wider animate-pulse">
                  --
                </span>
              ) : (
                <span className={`text-2xl font-black font-telemetry ${
                  isCritical ? 'text-red-400 text-glow-critical' : isWarning ? 'text-amber-400 text-glow-warning' : 'text-white'
                }`}>
                  {typeof tire.current_pressure === 'number' ? tire.current_pressure.toFixed(1) : '--'}
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono-val font-semibold">PSI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono-val mt-0.5">
              Status: <span className={isOffline ? 'text-amber-400 font-bold' : 'text-purple-300'}>{tire.pressure_status ?? 'UNKNOWN'}</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-purple-500/20">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              <span>Cavity Temperature</span>
            </div>
            <div className="flex items-baseline gap-1">
              {isOffline ? (
                <span className="text-2xl font-black font-telemetry text-red-400 tracking-wider">
                  --
                </span>
              ) : (
                <span className={`text-2xl font-black font-telemetry ${
                  isOverheating ? 'text-orange-400 animate-pulse drop-shadow-[0_0_8px_#ea580c]' :
                  isHighTemp ? 'text-amber-400' :
                  isSubZero ? 'text-cyan-300' :
                  'text-orange-400'
                }`}>
                  {typeof tire.temperature === 'number' ? tire.temperature.toFixed(1) : '--'}
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono-val font-semibold">°C</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono-val mt-0.5 flex items-center justify-between">
              <span>Physical: <span className="text-slate-300">{tire.physical_temperature?.toFixed(1) ?? '--'}°C</span></span>
              {isOffline ? (
                <span className="text-red-400 font-bold uppercase">OFFLINE</span>
              ) : isOverheating ? (
                <span className="text-orange-400 font-bold uppercase animate-pulse">OVERHEAT</span>
              ) : isHighTemp ? (
                <span className="text-amber-400 font-bold uppercase">ELEVATED</span>
              ) : isSubZero ? (
                <span className="text-cyan-400 font-bold uppercase">SUB-ZERO</span>
              ) : (
                <span className="text-emerald-400 font-bold uppercase">NOMINAL</span>
              )}
            </div>
          </div>

          {/* Sensor Availability */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-purple-500/20">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
              <Wifi className="w-3.5 h-3.5 text-purple-400" />
              <span>Sensor Telemetry</span>
            </div>
            <div className={`text-lg font-bold font-telemetry ${isOffline ? 'text-red-400' : 'text-emerald-400'}`}>
              {tire.sensor_status}
            </div>
            <div className="text-[10px] text-slate-400 font-mono-val mt-0.5">
              Link Health: <span className={isOffline ? 'text-red-400' : 'text-emerald-400'}>{tire.sensor_health?.toFixed(0) ?? (isOffline ? 0 : 100)}%</span>
            </div>
          </div>

          {/* Physical Tire Condition */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-purple-500/20">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
              <HeartPulse className="w-3.5 h-3.5 text-pink-400" />
              <span>Tire Physical Health</span>
            </div>
            <div className="text-lg font-bold font-telemetry text-cyan-300">
              {tire.tire_health?.toFixed(0) ?? 100}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono-val mt-0.5">
              Condition: <span className={isOffline ? 'text-slate-400' : 'text-cyan-300'}>{isOffline ? 'UNKNOWN' : tire.tire_physical_status}</span>
            </div>
          </div>
        </div>

        {/* Detailed SDV Diagnostics List (Requirement 17) */}
        <div className="p-3.5 rounded-xl bg-[#090b14]/80 border border-purple-500/20 space-y-2 text-xs font-mono-val mb-3">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Pressure:</span>
            <span className="font-bold text-white">
              {isOffline ? '-- PSI' : `${tire.current_pressure?.toFixed(1) ?? '--'} PSI`}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Pressure Status:</span>
            <span className={isOffline ? 'text-amber-400 font-bold' : tire.status === 'CRITICAL' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {isOffline ? 'UNKNOWN' : tire.pressure_status}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Temperature:</span>
            <span className={
              isOffline ? 'text-red-400' :
              isOverheating ? 'text-orange-400 font-bold animate-pulse' :
              isHighTemp ? 'text-amber-300 font-semibold' :
              isSubZero ? 'text-cyan-300 font-semibold' :
              'text-orange-300 font-semibold'
            }>
              {isOffline ? '-- °C' : `${tire.temperature?.toFixed(1) ?? '--'} °C`}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Thermal Status:</span>
            <span className={
              isOffline ? 'text-slate-400' :
              isOverheating ? 'text-orange-400 font-bold animate-pulse' :
              isHighTemp ? 'text-amber-400 font-bold' :
              isSubZero ? 'text-cyan-400 font-bold' :
              'text-emerald-400 font-semibold'
            }>
              {isOffline ? 'UNKNOWN' : (isOverheating ? 'OVERHEATING' : isHighTemp ? 'ELEVATED' : isSubZero ? 'SUB-ZERO' : 'NORMAL')}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Sensor:</span>
            <span className={isOffline ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {tire.sensor_status}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Sensor Health:</span>
            <span className={isOffline ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {tire.sensor_health?.toFixed(0) ?? (isOffline ? 0 : 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Last Valid Reading:</span>
            <span className={isOffline ? 'text-amber-400' : 'text-purple-300'}>
              {isOffline
                ? `${Math.round(tire.last_valid_reading_seconds_ago ?? 0)} seconds ago (${tire.last_valid_pressure?.toFixed(1)} PSI)`
                : 'Current (0s ago)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Tire Physical Status:</span>
            <span className={isOffline ? 'text-slate-400' : tire.tire_physical_status === 'CRITICAL' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {isOffline ? 'UNKNOWN' : tire.tire_physical_status}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Monitoring Status:</span>
            <span className={isOffline ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {tire.status}
            </span>
          </div>
        </div>

        {/* Sensor RF Telemetry Fault Controls */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-tech">
              {isOffline ? <WifiOff className="w-4 h-4 text-red-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
              <span>SENSOR HARDWARE TELEMETRY LINK</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              isOffline ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {isOffline ? 'OFFLINE (FAULT)' : 'ONLINE (433 MHz)'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-slate-400 font-mono-val">
              {isOffline ? 'Deactivated: ECU ceases reading pressure & flags SENSOR FAULT' : 'Transmitting pressure and temperature frames'}
            </p>
            <button
              onClick={handleToggleSensor}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                isOffline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
              }`}
            >
              {isOffline ? 'Restore Sensor (Turn ON)' : 'Simulate Fault (Turn OFF)'}
            </button>
          </div>
        </div>

        {/* Cavity Temperature Tuning Slider */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-tech">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span>CAVITY TEMPERATURE TUNING</span>
            </span>
            <button
              onClick={handleResetTemperature}
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono-val"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Auto Dynamic Physics</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-mono-val">
            <span className="text-slate-400">Target Temp:</span>
            <span className="font-bold text-orange-400 text-sm">{(tire.physical_temperature ?? 32).toFixed(1)}°C</span>
          </div>

          <input
            type="range"
            min="10"
            max="90"
            step="1"
            value={tire.physical_temperature ?? 32}
            onChange={(e) => handleSetTemperature(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { label: 'Cold (15°)', temp: 15 },
              { label: 'Nominal (34°)', temp: 34 },
              { label: 'Warm (50°)', temp: 50 },
              { label: 'Overheat (80°)', temp: 80 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => handleSetTemperature(p.temp)}
                className="py-1 text-[10px] font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-orange-600/30 hover:text-white transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-purple-500/20">
          <button
            onClick={() => onToggleLeak(tire.id, !tire.leak_enabled)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tire.leak_enabled
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-purple-600/30 text-purple-200 border border-purple-500/40 hover:bg-purple-600/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{tire.leak_enabled ? 'Disable Leak on this Tire' : 'Inject Leak on this Tire'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
