import React from 'react';
import { CircleDot, Gauge, Thermometer, Wifi, AlertTriangle, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import LivePressureChart from '../charts/LivePressureChart';

export default function TpmsPage({ snapshot, history, selectedTireId, onSelectTire }) {
  const tires = snapshot?.tires ?? {};
  const settings = snapshot?.settings;
  const warningThresh = settings?.nominal_pressure && settings?.warning_threshold_ratio
    ? settings.nominal_pressure * settings.warning_threshold_ratio
    : 30.6;
  const criticalThresh = settings?.nominal_pressure && settings?.critical_threshold_ratio
    ? settings.nominal_pressure * settings.critical_threshold_ratio
    : 27.2;

  const tireList = ['FL', 'FR', 'RL', 'RR'].map((id) => tires[id]).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 lg:p-5 rounded-2xl glass-panel-purple border border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-tech uppercase tracking-wider flex items-center gap-2">
            <CircleDot className="w-5 h-5 text-purple-400" />
            <span>TPMS Telemetry & Diagnostic Center</span>
          </h2>
          <p className="text-xs text-purple-300/70 mt-1 font-medium">
            4-Wheel Simultaneous Transceiver Array • Direct Pressure Sensor Integration • 433 MHz RF Protocol
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Sensors</div>
            <div className="text-sm font-bold text-emerald-400 font-mono-val">4 / 4 ONLINE</div>
          </div>
        </div>
      </div>

      {/* 4 Tires In-Depth Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {tireList.map((t) => {
          const isCritical = t.status === 'CRITICAL';
          const isWarning = t.status === 'WARNING';
          const isSelected = selectedTireId === t.id;

          return (
            <div
              key={t.id}
              onClick={() => onSelectTire(t.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isCritical
                  ? 'bg-red-500/15 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                  : isWarning
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : isSelected
                  ? 'bg-purple-900/30 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'glass-panel hover:border-purple-400/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center font-tech font-bold text-purple-300">
                  {t.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  isCritical ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                  isWarning ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {t.status}
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-300 mb-1">{t.position}</div>

              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono-val">Measured</div>
                  <div className="text-2xl font-black font-telemetry text-white">
                    {t.current_pressure.toFixed(1)} <span className="text-xs text-slate-400">PSI</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono-val">Temperature</div>
                  <div className="text-base font-bold font-telemetry text-slate-200">
                    {t.temperature.toFixed(1)}°C
                  </div>
                </div>
              </div>

              {/* Status details */}
              <div className="mt-3 pt-3 border-t border-purple-500/10 space-y-1 text-[11px] font-mono-val">
                <div className="flex justify-between text-slate-400">
                  <span>Nominal:</span>
                  <span className="text-slate-200">{t.nominal_pressure} PSI</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Deviation:</span>
                  <span className={t.pressure_loss > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                    {t.pressure_loss > 0 ? `-${t.pressure_loss.toFixed(1)} PSI` : '0.0 PSI'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>RF Transceiver:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Wifi className="w-2.5 h-2.5" /> 100% (-58 dBm)
                  </span>
                </div>
                {t.leak_enabled && (
                  <div className="flex justify-between text-red-400 font-bold">
                    <span>Leak Injected:</span>
                    <span>{t.leak_rate.toFixed(2)} PSI/min</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Graph on TPMS Telemetry page */}
      <div>
        <LivePressureChart
          history={history}
          warningThreshold={warningThresh}
          criticalThreshold={criticalThresh}
          nominalPressure={settings?.nominal_pressure ?? 34.0}
          isLive={snapshot?.status?.state === 'RUNNING'}
          tires={snapshot?.tires}
        />
      </div>

      {/* Telemetry Matrix Table */}
      <div className="rounded-2xl glass-panel p-5 overflow-x-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-tech mb-3">
          Detailed Telemetry Data Frame
        </h3>
        <table className="w-full text-left text-xs font-mono-val">
          <thead>
            <tr className="border-b border-purple-500/20 text-purple-300/80">
              <th className="py-2.5 px-3">Position</th>
              <th className="py-2.5 px-3">Channel</th>
              <th className="py-2.5 px-3">Pressure (PSI)</th>
              <th className="py-2.5 px-3">Base (No Noise)</th>
              <th className="py-2.5 px-3">Ratio</th>
              <th className="py-2.5 px-3">Temp (°C)</th>
              <th className="py-2.5 px-3">Fault Injection</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10 text-slate-300">
            {tireList.map((t) => (
              <tr key={t.id} className="hover:bg-purple-950/20 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-white">{t.position}</td>
                <td className="py-2.5 px-3 text-purple-400">{t.id}</td>
                <td className="py-2.5 px-3 font-bold text-white">{t.current_pressure.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-slate-400">{t.base_pressure.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-cyan-300">{t.pressure_percentage.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-slate-200">{t.temperature.toFixed(1)}</td>
                <td className="py-2.5 px-3">
                  {t.leak_enabled ? (
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {t.leak_rate} PSI/min
                    </span>
                  ) : (
                    <span className="text-slate-500">None</span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.status === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                    t.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
