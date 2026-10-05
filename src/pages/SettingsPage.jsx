import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Sliders, Shield, Palette, CheckCircle } from 'lucide-react';

export default function SettingsPage({ snapshot, onUpdateConfig }) {
  const currentSettings = snapshot?.settings ?? {};

  const [nominal, setNominal] = useState(currentSettings.nominal_pressure ?? 34.0);
  const [warningRatio, setWarningRatio] = useState(currentSettings.warning_threshold_ratio ?? 0.90);
  const [criticalRatio, setCriticalRatio] = useState(currentSettings.critical_threshold_ratio ?? 0.80);
  const [hysteresis, setHysteresis] = useState(currentSettings.hysteresis_psi ?? 0.25);
  const [noiseStd, setNoiseStd] = useState(currentSettings.noise_std ?? 0.09);
  const [updateInterval, setUpdateInterval] = useState(currentSettings.update_interval_sec ?? 0.5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateConfig({
      nominal_pressure: parseFloat(nominal),
      warning_threshold_ratio: parseFloat(warningRatio),
      critical_threshold_ratio: parseFloat(criticalRatio),
      hysteresis_psi: parseFloat(hysteresis),
      noise_std: parseFloat(noiseStd),
      update_interval_sec: parseFloat(updateInterval),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    setNominal(34.0);
    setWarningRatio(0.90);
    setCriticalRatio(0.80);
    setHysteresis(0.25);
    setNoiseStd(0.09);
    setUpdateInterval(0.5);
    onUpdateConfig({
      nominal_pressure: 34.0,
      warning_threshold_ratio: 0.90,
      critical_threshold_ratio: 0.80,
      hysteresis_psi: 0.25,
      noise_std: 0.09,
      update_interval_sec: 0.5,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 lg:p-5 rounded-2xl glass-panel-purple border border-purple-500/30 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white font-tech uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <span>Digital Twin Simulation Settings</span>
          </h2>
          <p className="text-xs text-purple-300/70 mt-1 font-medium">
            Fine-tune pneumatic physical thresholds, sensor noise models, and update telemetry rate.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-fadeIn">
            <CheckCircle className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Pressure Parameters */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-purple-500/20 text-xs font-bold uppercase text-purple-300 font-tech">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Pressure & Safety Thresholds</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nominal Cold Tire Pressure (PSI)
              </label>
              <input
                type="number"
                step="0.5"
                min="20"
                max="50"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white font-mono-val focus:outline-none focus:border-purple-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Factory baseline: 34.0 PSI</span>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Warning Threshold Ratio</span>
                <span className="text-amber-400 font-mono-val">
                  {(warningRatio * 100).toFixed(0)}% ({(nominal * warningRatio).toFixed(1)} PSI)
                </span>
              </div>
              <input
                type="range"
                min="0.75"
                max="0.95"
                step="0.01"
                value={warningRatio}
                onChange={(e) => setWarningRatio(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Critical Threshold Ratio</span>
                <span className="text-red-400 font-mono-val">
                  {(criticalRatio * 100).toFixed(0)}% ({(nominal * criticalRatio).toFixed(1)} PSI)
                </span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.85"
                step="0.01"
                value={criticalRatio}
                onChange={(e) => setCriticalRatio(parseFloat(e.target.value))}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Hysteresis Band (PSI)</span>
                <span className="text-purple-300 font-mono-val">{hysteresis} PSI</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={hysteresis}
                onChange={(e) => setHysteresis(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Prevents sensor noise from flickering state transitions</span>
            </div>
          </div>
        </div>

        {/* Section 2: Sensor & Simulation Physics */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-purple-500/20 text-xs font-bold uppercase text-cyan-300 font-tech">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Sensor Physics & Loop Timing</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Gaussian Noise Standard Deviation (σ)</span>
                <span className="text-cyan-300 font-mono-val">±{noiseStd} PSI</span>
              </div>
              <input
                type="range"
                min="0.00"
                max="0.40"
                step="0.01"
                value={noiseStd}
                onChange={(e) => setNoiseStd(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Higher noise simulates harsher electrical/vibrational jitter</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Broadcast / Telemetry Update Rate
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0.2, 0.5, 1.0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setUpdateInterval(rate)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      updateInterval === rate
                        ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate * 1000} ms
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 500 ms (2.0 Hz telemetry stream)</span>
            </div>

            <div className="pt-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Theme / Appearance
              </label>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>Futuristic Cyber Cockpit (Dark)</span>
                </span>
                <span className="text-xs text-purple-300 font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Factory Defaults</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/50 hover:brightness-110 active:scale-95 transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
}
