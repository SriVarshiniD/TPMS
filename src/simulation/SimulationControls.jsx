import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Sliders, 
  Gauge, 
  Flame, 
  FastForward, 
  ShieldCheck, 
  AlertTriangle,
  Thermometer,
  Wifi,
  WifiOff,
  Cpu,
  Snowflake,
  Sun,
  Wind,
  Activity,
  RefreshCw,
  Car
} from 'lucide-react';

const SPEED_OPTIONS = [0.5, 1, 2, 5, 10, 20];
const DRIVE_MODES = [
  { id: 'ECO', label: 'ECO', desc: 'Efficiency & Low Rolling Resistance', color: 'emerald', border: 'border-emerald-500/40', bg: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'COMFORT', label: 'COMFORT', desc: 'Balanced Touring & Damping', color: 'cyan', border: 'border-cyan-500/40', bg: 'bg-cyan-500/20 text-cyan-300' },
  { id: 'SPORT', label: 'SPORT', desc: 'Dynamic Grip & Higher Deflection', color: 'amber', border: 'border-amber-500/40', bg: 'bg-amber-500/20 text-amber-300' },
  { id: 'SDV-TWIN', label: 'SDV-TWIN', desc: 'Predictive Autonomous Calibration', color: 'purple', border: 'border-purple-500/50', bg: 'bg-purple-600/30 text-purple-200' },
];

export default function SimulationControls({ 
  snapshot, 
  onStart, 
  onPause, 
  onReset, 
  onSetScenario, 
  onUpdateConfig, 
  onDemo 
}) {
  const [activeTab, setActiveTab] = useState('dynamics'); // 'dynamics' | 'sensors' | 'thermal' | 'leak'
  const [selectedTireForTemp, setSelectedTireForTemp] = useState('ALL');

  const isRunning = snapshot?.status?.state === 'RUNNING';
  const settings = snapshot?.settings;
  const telemetry = snapshot?.telemetry;
  const tires = snapshot?.tires ?? {};
  const activeScenario = snapshot?.status?.active_scenario;

  const currentMultiplier = settings?.time_multiplier ?? 1.0;
  const currentLeakRate = settings?.leak_rate ?? 0.05;
  const currentAffectedTire = settings?.affected_tire ?? 'RR';
  const currentLeakEnabled = settings?.leak_enabled ?? true;
  const currentNominal = settings?.nominal_pressure ?? 34.0;
  const currentWarningRatio = settings?.warning_threshold_ratio ?? 0.9;
  const currentCriticalRatio = settings?.critical_threshold_ratio ?? 0.8;

  const currentSpeed = telemetry?.speed_kmh ?? 70;
  const currentAmbientTemp = telemetry?.ambient_temp_c ?? 28;
  const currentDriveMode = telemetry?.drive_mode ?? 'COMFORT';

  // Count offline sensors
  const tireIds = ['FL', 'FR', 'RL', 'RR'];
  const offlineSensors = tireIds.filter(tid => tires[tid]?.sensor_status === 'OFFLINE');
  const hasSensorFault = offlineSensors.length > 0;

  // Toggle sensor state
  const handleToggleSensor = (tid) => {
    onUpdateConfig({ sensor_toggle: tid });
  };

  // Set all sensors online
  const handleRestoreAllSensors = () => {
    onUpdateConfig({ reset_sensors: true });
  };

  // Set tire temperature
  const handleSetTireTemp = (targetTid, tempVal) => {
    if (targetTid === 'ALL') {
      const updates = {};
      tireIds.forEach(id => { updates[id] = tempVal; });
      onUpdateConfig({ tire_temperatures: updates });
    } else {
      onUpdateConfig({ tire_temperatures: { [targetTid]: tempVal } });
    }
  };

  // Reset tire temperatures to automatic physics
  const handleResetTireTemps = () => {
    onUpdateConfig({ reset_temperatures: true });
  };

  return (
    <div className="w-full rounded-2xl glass-panel p-4 lg:p-5 space-y-4">
      {/* Title & Playback Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <div>
            <h3 className="text-xs lg:text-sm font-bold tracking-wider uppercase text-white font-tech">
              Simulation Control Deck
            </h3>
            <p className="text-[10px] text-purple-300/60 font-mono-val">
              Live Vehicle Telemetry & Fault Injection Matrix
            </p>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={isRunning ? onPause : onStart}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pause Engine' : 'Resume Engine'}</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
            title="Reset Simulation to Factory State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Control Category Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-purple-500/20 text-xs">
        <button
          onClick={() => setActiveTab('dynamics')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold transition-all ${
            activeTab === 'dynamics'
              ? 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vehicle & Climate</span>
        </button>

        <button
          onClick={() => setActiveTab('sensors')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold transition-all relative ${
            activeTab === 'sensors'
              ? 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Wifi className="w-3.5 h-3.5 text-purple-400" />
          <span>Sensor Faults</span>
          {hasSensorFault && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('thermal')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold transition-all ${
            activeTab === 'thermal'
              ? 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5 text-orange-400" />
          <span>Tire Thermal</span>
        </button>

        <button
          onClick={() => setActiveTab('leak')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold transition-all ${
            activeTab === 'leak'
              ? 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span>Leak & Clock</span>
        </button>
      </div>

      {/* TAB 1: VEHICLE DYNAMICS & CLIMATE (Speed, Drive Mode, Outside Temp) */}
      {activeTab === 'dynamics' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Vehicle Speed Adjustment */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-tech">
                <Gauge className="w-4 h-4 text-purple-400" />
                <span>VEHICLE SPEED</span>
              </span>
              <div className="flex items-baseline gap-1 font-mono-val">
                <span className="text-lg font-black text-white">{currentSpeed}</span>
                <span className="text-xs text-purple-300 font-semibold">km/h</span>
                <span className="text-[10px] text-slate-400 ml-1">
                  ({Math.round(currentSpeed * 0.621371)} mph)
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="220"
              step="5"
              value={currentSpeed}
              onChange={(e) => onUpdateConfig({ vehicle_speed_kmh: parseFloat(e.target.value) })}
              className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            {/* Quick Speed Presets */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { label: '0 km/h', speed: 0 },
                { label: '30 km/h', speed: 30 },
                { label: '60 km/h', speed: 60 },
                { label: '100 km/h', speed: 100 },
                { label: '140 km/h', speed: 140 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => onUpdateConfig({ vehicle_speed_kmh: item.speed })}
                  className={`py-1 px-1 text-[11px] font-semibold rounded-lg border transition-all ${
                    currentSpeed === item.speed
                      ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-purple-300/60 font-mono-val mt-1">
              * Speed dynamically induces tire deflection heating (T_target = Ambient + Base + k_speed × (Speed/100)²)
            </p>
          </div>

          {/* Drive Mode Selector */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-tech">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>CHASSIS DRIVE MODE</span>
              </span>
              <span className="text-xs font-bold font-mono-val text-indigo-300">
                Active: {currentDriveMode}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DRIVE_MODES.map((mode) => {
                const isActive = currentDriveMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onUpdateConfig({ drive_mode: mode.id })}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isActive
                        ? `${mode.bg} ${mode.border} shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-white/20 font-bold`
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-purple-500/30 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{mode.label}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping-slow" />}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                      {mode.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outside Ambient Temperature */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-tech">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span>OUTSIDE AMBIENT TEMPERATURE</span>
              </span>
              <div className="flex items-baseline gap-1 font-mono-val">
                <span className="text-lg font-black text-cyan-300">{currentAmbientTemp}°C</span>
                <span className="text-[10px] text-slate-400 ml-1">
                  ({Math.round((currentAmbientTemp * 9) / 5 + 32)}°F)
                </span>
              </div>
            </div>

            <input
              type="range"
              min="-20"
              max="50"
              step="1"
              value={currentAmbientTemp}
              onChange={(e) => onUpdateConfig({ ambient_temp_c: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            {/* Weather Climate Presets */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: '20°C (Cool)', temp: 20, icon: Wind },
                { label: '25°C (Standard)', temp: 25, icon: Sun },
                { label: '35°C (Warm)', temp: 35, icon: Sun },
                { label: '40°C (Hot)', temp: 40, icon: Flame },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => onUpdateConfig({ ambient_temp_c: item.temp })}
                    className={`py-1 px-1 text-[11px] font-semibold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      currentAmbientTemp === item.temp
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[10px] text-cyan-300/80 flex items-center justify-between">
              <span>Ideal Gas Law: P₁/T₁ = P₂/T₂ (in Kelvin)</span>
              <span className="font-mono-val font-semibold">T_target = Ambient + Base + Speed_Heat</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SENSOR TELEMETRY FAULT INJECTION (Online / Offline Switched Faults) */}
      {activeTab === 'sensors' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Quick Sensor Checkbox Bar (Requirement 13) */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/25 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 font-tech flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-purple-400" />
                <span>QUICK SENSOR AVAILABILITY MATRIX</span>
              </span>
              <button
                onClick={handleRestoreAllSensors}
                className="text-[11px] text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restore All 4 Online</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {tireIds.map((tid) => {
                const isOnline = tires[tid]?.sensor_status === 'ONLINE';
                return (
                  <button
                    key={tid}
                    onClick={() => handleToggleSensor(tid)}
                    className={`flex items-center justify-center gap-2 py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      isOnline 
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                        : 'bg-red-950/60 text-red-300 border-red-500/50 hover:bg-red-900/60 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                    }`}
                  >
                    <span className="text-sm">{isOnline ? '☑' : '☐'}</span>
                    <span>{tid}</span>
                    <span className="text-[10px] font-mono-val opacity-80 font-normal">
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tireIds.map((tid) => {
              const tire = tires[tid];
              const isOffline = tire?.sensor_status === 'OFFLINE';
              const posName = tire?.position ?? tid;

              return (
                <div
                  key={tid}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isOffline
                      ? 'bg-red-950/30 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                      : 'bg-slate-900/60 border-purple-500/25'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-xs font-bold font-tech text-purple-300">
                          {tid}
                        </span>
                        <span className="text-xs font-bold text-white font-tech">
                          {posName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono-val mt-1">
                        Sensor ID: TPMS-{tid}-RF01
                      </div>
                    </div>

                    <div className="text-right">
                      {isOffline ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 animate-pulse">
                          <WifiOff className="w-3 h-3 text-red-400" />
                          <span>FAULT / OFFLINE</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-emerald-400" />
                          <span>ONLINE</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono-val">
                      {isOffline ? 'No telemetry packets received' : 'Transmitting at 2.0 Hz'}
                    </span>
                    <button
                      onClick={() => handleToggleSensor(tid)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                        isOffline
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                      }`}
                    >
                      {isOffline ? 'Restore Sensor (Turn ON)' : 'Simulate Fault (Turn OFF)'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200/80 leading-relaxed">
            <strong className="text-purple-300 font-tech">ECU Fault Diagnostics:</strong> Turning a virtual sensor <span className="text-red-400 font-bold">OFFLINE</span> simulates an RF transceiver failure, antenna shield defect, or depleted coin-cell battery. The vehicle central gateway logs a DTC fault and switches system status to <span className="text-amber-400 font-semibold">ATTENTION REQUIRED</span>.
          </div>
        </div>
      )}

      {/* TAB 3: TIRE CAVITY TEMPERATURE TUNING */}
      {activeTab === 'thermal' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-tech font-bold uppercase flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span>Tire Cavity Temperature Override</span>
            </span>
            <button
              onClick={handleResetTireTemps}
              className="text-[11px] text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Auto Dynamic Physics Heating</span>
            </button>
          </div>

          {/* Tire Selector */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-purple-500/20 space-y-2">
            <div className="text-xs text-slate-300 font-semibold mb-1">
              Select Target Tire to Heat / Cool:
            </div>
            <div className="flex items-center gap-1.5">
              {['ALL', 'FL', 'FR', 'RL', 'RR'].map((tid) => {
                const t = tid !== 'ALL' ? tires[tid] : null;
                const tempVal = t?.temperature ?? t?.physical_temperature;
                const isHot = tempVal !== undefined && tempVal >= 70;
                const isWarm = tempVal !== undefined && tempVal >= 50 && tempVal < 70;
                const isCold = tempVal !== undefined && tempVal <= 0;

                return (
                  <button
                    key={tid}
                    onClick={() => setSelectedTireForTemp(tid)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all relative flex items-center justify-center gap-1 ${
                      selectedTireForTemp === tid
                        ? 'bg-orange-600 text-white border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{tid === 'ALL' ? 'All Tires' : tid}</span>
                    {isHot && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />}
                    {isWarm && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    {isCold && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 font-tech">
                {selectedTireForTemp === 'ALL' ? 'ALL TIRES CAVITY TEMP' : `${selectedTireForTemp} CAVITY TEMP`}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-1 font-mono-val">
                  <span className="text-lg font-black text-orange-400">
                    {selectedTireForTemp === 'ALL'
                      ? (tires.FL?.temperature ?? 32).toFixed(1)
                      : (tires[selectedTireForTemp]?.temperature ?? 32).toFixed(1)}
                    °C
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">
                    ({Math.round(((tires[selectedTireForTemp === 'ALL' ? 'FL' : selectedTireForTemp]?.temperature ?? 32) * 9) / 5 + 32)}°F)
                  </span>
                </div>
                {(() => {
                  const currentTemp = selectedTireForTemp === 'ALL'
                    ? (tires.FL?.temperature ?? tires.FL?.physical_temperature ?? 32)
                    : (tires[selectedTireForTemp]?.temperature ?? tires[selectedTireForTemp]?.physical_temperature ?? 32);
                  if (currentTemp >= 70) {
                    return (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-orange-600 text-white animate-pulse">
                        OVERHEAT
                      </span>
                    );
                  }
                  if (currentTemp >= 50) {
                    return (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-600 text-white">
                        ELEVATED
                      </span>
                    );
                  }
                  if (currentTemp <= 0) {
                    return (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-600 text-white">
                        SUB-ZERO
                      </span>
                    );
                  }
                  return (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">
                      NOMINAL
                    </span>
                  );
                })()}
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={tires[selectedTireForTemp === 'ALL' ? 'FL' : selectedTireForTemp]?.temperature ?? 32}
              onChange={(e) => handleSetTireTemp(selectedTireForTemp, parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            {/* Quick Thermal Presets */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: 'Cold (15°C)', temp: 15 },
                { label: 'Nominal (34°C)', temp: 34 },
                { label: 'Hot (55°C)', temp: 55 },
                { label: 'Overheat (85°C)', temp: 85 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSetTireTemp(selectedTireForTemp, item.temp)}
                  className="py-1 px-1.5 text-[11px] font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-orange-600/30 hover:text-white transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-orange-300/60 font-mono-val mt-1">
              * Changing cavity temp directly shifts tire pressure via thermal expansion (~0.08 PSI per °C).
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: LEAK & CLOCK RATE CONTROLS */}
      {activeTab === 'leak' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Preset Scenarios Deck */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-2 font-tech flex items-center justify-between">
              <span>Preset Simulation Scenarios</span>
              <span className="text-[9px] text-slate-400 font-mono-val">1-Click Injection</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onSetScenario('normal')}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                  activeScenario === 'Normal Driving'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-[0_0_12px_rgba(160,185,129,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-purple-500/30'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Normal</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">All 4 tires nominal</div>
              </button>

              <button
                onClick={() => onSetScenario('slow_leak_rr')}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                  activeScenario === 'Slow Leak — Rear Right'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-purple-500/30'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Slow Leak (RR)</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">0.05 PSI/min (Default)</div>
              </button>

              <button
                onClick={() => onSetScenario('slow_leak_fl')}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                  activeScenario === 'Slow Leak — Front Left'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-purple-500/30'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Slow Leak (FL)</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Alternative tire fault</div>
              </button>

              <button
                onClick={() => onSetScenario('rapid_leak_rr')}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                  activeScenario === 'Rapid Leak — Rear Right'
                    ? 'bg-red-500/20 border-red-500/50 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-purple-500/30'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Rapid Leak</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">0.35 PSI/min puncture</div>
              </button>
            </div>
          </div>

          {/* Speed Multiplier & Leak Rate Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Simulation Speed Multiplier */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/20">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 font-tech">
                  <FastForward className="w-3.5 h-3.5 text-purple-400" />
                  <span>Simulation Clock Rate</span>
                </span>
                <span className="font-bold text-purple-300 font-mono-val">
                  {currentMultiplier}x ({currentMultiplier === 1 ? 'Real-Time' : `${currentMultiplier}x Accelerated`})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {SPEED_OPTIONS.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => onUpdateConfig({ time_multiplier: rate })}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                      currentMultiplier === rate
                        ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Affected Tire & Leak Toggle */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/20">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 font-tech">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Target Tire & Leak Toggle</span>
                </span>
                <span className="text-[10px] font-mono-val">
                  {currentLeakEnabled ? (
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span>{currentAffectedTire} LEAK ACTIVE</span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>ALL LEAKS DISABLED</span>
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 flex-1">
                  {['FL', 'FR', 'RL', 'RR'].map((tid) => {
                    const isTarget = currentAffectedTire === tid;
                    const isActivelyLeaking = isTarget && currentLeakEnabled;
                    return (
                      <button
                        key={tid}
                        onClick={() => onUpdateConfig({ affected_tire: tid, leak_enabled: true })}
                        className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                          isActivelyLeaking
                            ? 'bg-red-600/30 text-red-200 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                            : isTarget
                            ? 'bg-purple-900/40 text-purple-200 border-purple-500/50'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {tid}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => onUpdateConfig({ leak_enabled: !currentLeakEnabled })}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    currentLeakEnabled
                      ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {currentLeakEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>

          {/* Sliders for Leak Rate & Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Leak Rate Slider */}
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-semibold">Leak Rate:</span>
                <span className="font-mono-val font-bold text-amber-400">{currentLeakRate.toFixed(2)} PSI/min</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="1.0"
                step="0.01"
                value={currentLeakRate}
                onChange={(e) => onUpdateConfig({ leak_rate: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Warning Threshold Slider */}
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-semibold">Warning (%):</span>
                <span className="font-mono-val font-bold text-amber-400">
                  {(currentWarningRatio * 100).toFixed(0)}% ({(currentNominal * currentWarningRatio).toFixed(1)} PSI)
                </span>
              </div>
              <input
                type="range"
                min="0.75"
                max="0.95"
                step="0.01"
                value={currentWarningRatio}
                onChange={(e) => onUpdateConfig({ warning_threshold_ratio: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Critical Threshold Slider */}
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-semibold">Critical (%):</span>
                <span className="font-mono-val font-bold text-red-400">
                  {(currentCriticalRatio * 100).toFixed(0)}% ({(currentNominal * currentCriticalRatio).toFixed(1)} PSI)
                </span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.85"
                step="0.01"
                value={currentCriticalRatio}
                onChange={(e) => onUpdateConfig({ critical_threshold_ratio: parseFloat(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
