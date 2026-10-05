import React from 'react';
import { 
  Radio, 
  Thermometer, 
  Gauge, 
  Sparkles, 
  Activity, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw,
  Cpu,
  Wifi,
  WifiOff,
  HeartPulse
} from 'lucide-react';

export default function Header({ 
  snapshot, 
  isConnected, 
  isWs, 
  latency, 
  onStart, 
  onPause, 
  onReset, 
  onDemo,
  onUpdateConfig
}) {
  const isRunning = snapshot?.status?.state === 'RUNNING';
  const speed = snapshot?.telemetry?.speed_kmh ?? 70;
  const temp = snapshot?.telemetry?.ambient_temp_c ?? 28;
  const driveMode = snapshot?.telemetry?.drive_mode ?? 'COMFORT';
  const overallStatus = snapshot?.status?.overall_status ?? 'NORMAL';
  const sensorsOnline = snapshot?.status?.sensors_online ?? '4 / 4';
  const tpmsHealth = snapshot?.status?.overall_tpms_health ?? snapshot?.status?.health_score ?? 100;
  const systemHealth = snapshot?.status?.tpms_system_health ?? 100;

  const isDegraded = overallStatus !== 'NORMAL' || sensorsOnline !== '4 / 4';

  const statusBadgeColor = 
    overallStatus === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40 text-glow-critical' :
    overallStatus === 'ATTENTION REQUIRED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 text-glow-warning' :
    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

  // Cycle speed presets on click
  const handleCycleSpeed = () => {
    if (!onUpdateConfig) return;
    const presets = [0, 50, 100, 160];
    const currentIndex = presets.indexOf(speed);
    const nextIndex = currentIndex === -1 || currentIndex === presets.length - 1 ? 0 : currentIndex + 1;
    onUpdateConfig({ vehicle_speed_kmh: presets[nextIndex] });
  };

  // Cycle temperature presets on click
  const handleCycleTemp = () => {
    if (!onUpdateConfig) return;
    const presets = [-5, 15, 28, 42];
    const currentIndex = presets.indexOf(temp);
    const nextIndex = currentIndex === -1 || currentIndex === presets.length - 1 ? 0 : currentIndex + 1;
    onUpdateConfig({ ambient_temp_c: presets[nextIndex] });
  };

  // Cycle drive modes on click
  const handleCycleDriveMode = () => {
    if (!onUpdateConfig) return;
    const modes = ['ECO', 'COMFORT', 'SPORT', 'SDV-TWIN'];
    const currentIndex = modes.indexOf(driveMode);
    const nextIndex = currentIndex === -1 || currentIndex === modes.length - 1 ? 0 : currentIndex + 1;
    onUpdateConfig({ drive_mode: modes[nextIndex] });
  };

  return (
    <header className="w-full border-b border-purple-500/20 bg-[#090b14]/90 backdrop-blur-xl px-4 lg:px-6 py-3 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/40 to-blue-600/40 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.35)]">
          <Activity className="w-5 h-5 text-purple-300 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-bold tracking-wider text-white font-tech uppercase">
              TPMS DIGITAL TWIN
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              SDV Architecture
            </span>
          </div>
          <p className="text-xs text-purple-300/70 tracking-wide font-medium">
            Software-Defined Vehicle Tire Monitoring & Real-Time Physics Twin
          </p>
        </div>
      </div>

      {/* Center Action Controls (Playback & Demo Mode) */}
      <div className="flex items-center gap-2 bg-slate-900/80 border border-purple-500/20 p-1.5 rounded-xl">
        <button
          onClick={isRunning ? onPause : onStart}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            isRunning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
          title={isRunning ? "Pause Simulation" : "Start Simulation"}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'PAUSE' : 'START'}</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/80 hover:text-white transition-all"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>

        <div className="h-4 w-px bg-purple-500/30 mx-1" />

        <button
          onClick={onDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-400/50 hover:brightness-110 active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-bounce" />
          <span>DEMO MODE</span>
        </button>
      </div>

      {/* Right Telemetry Gauges (Requirement 16) */}
      <div className="flex items-center gap-2.5 lg:gap-3.5">
        {/* Speed */}
        <div 
          onClick={handleCycleSpeed}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-purple-500/50 hover:bg-slate-900/90 transition-all select-none group"
          title="Click to cycle vehicle speed preset"
        >
          <Gauge className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <div className="text-right">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Speed</div>
            <div className="text-xs font-bold text-white font-mono-val">{speed} km/h</div>
          </div>
        </div>

        {/* Ambient Temp */}
        <div 
          onClick={handleCycleTemp}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all select-none group"
          title="Click to cycle outside temperature preset"
        >
          <Thermometer className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <div className="text-right">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Ambient</div>
            <div className="text-xs font-bold text-white font-mono-val">{temp}°C</div>
          </div>
        </div>

        {/* Drive Mode */}
        <div 
          onClick={handleCycleDriveMode}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all select-none group"
          title="Click to cycle drive mode"
        >
          <Cpu className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <div className="text-right">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Mode</div>
            <div className="text-xs font-bold text-indigo-300 font-mono-val">{driveMode}</div>
          </div>
        </div>

        {/* Sensors Online (Requirement 16) */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
          sensorsOnline === '4 / 4' 
            ? 'bg-slate-900/60 border-slate-800' 
            : 'bg-red-950/40 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse'
        }`}>
          {sensorsOnline === '4 / 4' ? (
            <Wifi className="w-4 h-4 text-emerald-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <div className="text-right">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Sensors</div>
            <div className={`text-xs font-bold font-mono-val ${sensorsOnline === '4 / 4' ? 'text-emerald-400' : 'text-red-300'}`}>
              {sensorsOnline}
            </div>
          </div>
        </div>

        {/* TPMS Health & Overall Status (Requirement 16) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <HeartPulse className={`w-4 h-4 ${isDegraded ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
          <div className="text-right">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">TPMS Health</div>
            <div className="text-xs font-bold font-mono-val flex items-center gap-1.5">
              <span className={isDegraded ? 'text-amber-300' : 'text-white'}>{tpmsHealth.toFixed(0)}%</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${statusBadgeColor}`}>
                {overallStatus === 'ATTENTION REQUIRED' ? 'ATTN' : overallStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Live Signal Indicator */}
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
          <div className="relative flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {isConnected && (
              <div className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400/40 animate-ping" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="text-[9px] font-bold tracking-widest uppercase text-emerald-400">
              {isConnected ? (isWs ? 'LIVE WS' : 'LIVE REST') : 'OFFLINE'}
            </div>
            <div className="text-[8px] text-slate-500 font-mono-val">
              {latency}ms
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
