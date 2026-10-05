import React from 'react';
import { ShieldCheck, AlertTriangle, Activity, Wifi, Radio, HeartPulse, Cpu } from 'lucide-react';

export default function SystemStatusPanel({ snapshot }) {
  const overallStatus = snapshot?.status?.overall_status ?? 'NORMAL';
  const overallHealth = snapshot?.status?.overall_tpms_health ?? snapshot?.status?.health_score ?? 100.0;
  const systemHealth = snapshot?.status?.tpms_system_health ?? 100.0;
  const tireHealth = snapshot?.status?.tire_health_score ?? 100.0;
  const sensorsOnline = snapshot?.status?.sensors_online ?? '4 / 4';
  const tires = snapshot?.tires ?? {};
  const twin = snapshot?.status?.digital_twin;

  const isCritical = overallStatus === 'CRITICAL';
  const isAttention = overallStatus === 'ATTENTION REQUIRED';

  const statusBadge = isCritical ? (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
      <AlertTriangle className="w-3.5 h-3.5" />
      <span>CRITICAL ALERT</span>
    </span>
  ) : isAttention ? (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
      <AlertTriangle className="w-3.5 h-3.5" />
      <span>ATTENTION REQUIRED</span>
    </span>
  ) : (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>ALL SYSTEMS NOMINAL</span>
    </span>
  );

  return (
    <div className="w-full rounded-2xl glass-panel p-4 lg:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs lg:text-sm font-bold tracking-wider uppercase text-white font-tech">
            TPMS System Diagnostics & Health
          </h3>
        </div>
        {statusBadge}
      </div>

      {/* Dual Health Scores: Tire Physical Condition vs TPMS Monitoring System (Requirements 8, 11, 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* TPMS Monitoring System Health */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-purple-500/20 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span>TPMS Sensor Availability</span>
            </span>
            <span className={`font-bold font-telemetry ${systemHealth < 100 ? 'text-amber-400' : 'text-cyan-300'}`}>
              {systemHealth.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                systemHealth < 70 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : systemHealth < 100 ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, systemHealth))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono-val">
            <span>Active Transceivers: {sensorsOnline}</span>
            <span>Weight: 30%</span>
          </div>
        </div>

        {/* Physical Tire Health */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-purple-500/20 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-pink-400" />
              <span>Tire Physical Condition</span>
            </span>
            <span className={`font-bold font-telemetry ${tireHealth < 80 ? 'text-amber-400' : 'text-pink-300'}`}>
              {tireHealth.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                tireHealth < 60 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : tireHealth < 85 ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-pink-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, tireHealth))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono-val">
            <span>Pressure & Thermal Delta</span>
            <span>Weight: 70%</span>
          </div>
        </div>
      </div>

      {/* Overall Composite TPMS Health (Requirement 12) */}
      <div className="p-3 rounded-xl bg-[#0b0e1b]/90 border border-purple-500/30">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-200 font-bold flex items-center gap-1.5 font-tech">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>OVERALL TPMS HEALTH: {overallHealth.toFixed(1)}%</span>
          </span>
          <span className="text-[10px] text-purple-300/80 font-mono-val">
            (0.70 × Tire + 0.30 × System)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 border border-purple-500/20 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical
                ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_12px_#ef4444]'
                : isAttention
                ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_#f59e0b]'
                : 'bg-gradient-to-r from-purple-600 to-cyan-400 shadow-[0_0_12px_#a855f7]'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, overallHealth))}%` }}
          />
        </div>
      </div>

      {/* Four Tires Mini Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
        {['FL', 'FR', 'RL', 'RR'].map((tid) => {
          const t = tires[tid];
          const isOffline = t?.sensor_status === 'OFFLINE' || t?.sensor_status === 'STALE';
          const st = isOffline ? 'SENSOR FAULT' : (t?.status ?? 'NORMAL');
          const p = typeof t?.current_pressure === 'number' ? `${t.current_pressure.toFixed(1)} PSI` : '-- PSI';

          return (
            <div
              key={tid}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                isOffline
                  ? 'bg-red-950/30 border-red-500/50 text-red-300'
                  : st === 'CRITICAL'
                  ? 'bg-red-500/15 border-red-500/40 text-red-300'
                  : st === 'WARNING'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900/50 border-purple-500/15 text-slate-300'
              }`}
            >
              <div>
                <div className="font-bold font-tech text-white">{tid}</div>
                <div className="text-[10px] text-slate-400 font-mono-val">{p}</div>
              </div>
              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                isOffline ? 'bg-red-600/40 text-red-200 animate-pulse' :
                st === 'CRITICAL' ? 'bg-red-600/40 text-red-200' :
                st === 'WARNING' ? 'bg-amber-600/40 text-amber-200' :
                'bg-emerald-600/20 text-emerald-300'
              }`}>
                {isOffline ? 'OFFLINE' : st === 'NORMAL' ? 'Nominal' : st}
              </span>
            </div>
          );
        })}
      </div>

      {/* Digital Twin State Summary */}
      <div className="pt-2 border-t border-purple-500/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Virtual Vehicle</div>
          <div className="font-bold text-emerald-400 mt-0.5 font-mono-val">{twin?.virtual_vehicle ?? 'CONNECTED'}</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Sensor Streams</div>
          <div className="font-bold text-cyan-400 mt-0.5 font-mono-val">{sensorsOnline} ACTIVE</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Simulation Engine</div>
          <div className="font-bold text-purple-300 mt-0.5 font-mono-val">{snapshot?.status?.state ?? 'RUNNING'}</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Overall Status</div>
          <div className={`font-bold mt-0.5 font-mono-val ${isCritical ? 'text-red-400' : isAttention ? 'text-amber-400' : 'text-emerald-400'}`}>
            {overallStatus}
          </div>
        </div>
      </div>
    </div>
  );
}
