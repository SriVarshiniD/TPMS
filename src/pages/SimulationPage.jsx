import React from 'react';
import { Sliders, BookOpen, Sparkles, Zap, Flame, ShieldCheck, Activity } from 'lucide-react';
import SimulationControls from '../simulation/SimulationControls';
import LivePressureChart from '../charts/LivePressureChart';

export default function SimulationPage({
  snapshot,
  history,
  onStart,
  onPause,
  onReset,
  onSetScenario,
  onUpdateConfig,
  onDemo
}) {
  const isRunning = snapshot?.status?.state === 'RUNNING';
  const settings = snapshot?.settings;
  const warningThresh = settings?.nominal_pressure && settings?.warning_threshold_ratio
    ? settings.nominal_pressure * settings.warning_threshold_ratio
    : 30.6;
  const criticalThresh = settings?.nominal_pressure && settings?.critical_threshold_ratio
    ? settings.nominal_pressure * settings.critical_threshold_ratio
    : 27.2;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 lg:p-5 rounded-2xl glass-panel-purple border border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-tech uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <span>Simulation Lab & Mathematical Model</span>
          </h2>
          <p className="text-xs text-purple-300/70 mt-1 font-medium">
            Physics-Based Digital Twin Telemetry Engine • Stochastic Gaussian Noise • Pneumatic Leak Dynamics
          </p>
        </div>

        <button
          onClick={onDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/50 hover:brightness-110 active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-bounce" />
          <span>Launch Fast Demo Run</span>
        </button>
      </div>

      {/* Mathematical Principles Cards (Viva Presentation Helper) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nominal Pressure + Sensor Noise */}
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-tech font-bold text-xs uppercase">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>1. Nominal Sensor Telemetry</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-cyan-500/30 text-xs font-mono-val text-cyan-200">
            P(t) = P_nominal + 𝒩(0, σ²)
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Healthy tires fluctuate around nominal 34.0 PSI using a Gaussian noise standard deviation σ ≈ 0.09 PSI, reflecting physical capacitive sensor measurement jitter without false alarms.
          </p>
        </div>

        {/* Slow Pneumatic Leak Formula */}
        <div className="p-4 rounded-2xl glass-panel border border-purple-500/20 space-y-2">
          <div className="flex items-center gap-2 text-purple-300 font-tech font-bold text-xs uppercase">
            <Flame className="w-4 h-4 text-purple-400" />
            <span>2. Pneumatic Leak Injection</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-purple-500/30 text-xs font-mono-val text-purple-200">
            P_leak(t) = P_nominal - (r · t) + 𝒩(0, σ²)
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            The injected leaking tire (default RR) sheds pressure at rate r = 0.05 PSI/min (or configurable). The clock rate multiplier accelerates elapsed time for fast demonstrations.
          </p>
        </div>

        {/* Dual-Threshold & Hysteresis */}
        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-tech font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>3. Thresholds & Hysteresis</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-amber-500/30 text-xs font-mono-val text-amber-200">
            Warning: &lt; 90% (30.6 PSI) | Critical: &lt; 80% (27.2 PSI)
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Hysteresis (Δ = 0.25 PSI) prevents sensor noise chatter when pressure hovers right at threshold boundaries, ensuring clean, non-flickering state machine transitions.
          </p>
        </div>
      </div>

      {/* Simulation Controls Deck */}
      <div>
        <SimulationControls
          snapshot={snapshot}
          onStart={onStart}
          onPause={onPause}
          onReset={onReset}
          onSetScenario={onSetScenario}
          onUpdateConfig={onUpdateConfig}
          onDemo={onDemo}
        />
      </div>

      {/* Live Graph */}
      <div>
        <LivePressureChart
          history={history}
          warningThreshold={warningThresh}
          criticalThreshold={criticalThresh}
          nominalPressure={settings?.nominal_pressure ?? 34.0}
          isLive={isRunning}
          tires={snapshot?.tires}
        />
      </div>
    </div>
  );
}
