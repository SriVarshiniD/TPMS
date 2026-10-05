import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, Bell, Volume2, VolumeX, Trash2 } from 'lucide-react';

export default function AlertsPanel({ alerts = [] }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'WARNING' | 'CRITICAL'
  const [audioEnabled, setAudioEnabled] = useState(true);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>CRITICAL</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>WARNING</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
            <Info className="w-2.5 h-2.5" />
            <span>INFO</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full rounded-2xl glass-panel p-4 lg:p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs lg:text-sm font-bold tracking-wider uppercase text-white font-tech">
            Real-Time Diagnostic Alerts
          </h3>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {alerts.length}
          </span>
        </div>

        {/* Filter Pills & Audio Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-purple-500/20 text-[10px]">
            {['ALL', 'WARNING', 'CRITICAL'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={audioEnabled ? 'Mute Cockpit Chime' : 'Enable Cockpit Chime'}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Alerts Scrollable Stream */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono-val">
            No diagnostic alerts in this category
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-2.5 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-500/10 border-red-500/30 text-red-200'
                  : alert.severity === 'WARNING'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-slate-900/50 border-purple-500/15 text-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  {alert.tire && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-purple-300 border border-purple-500/30 font-tech">
                      TIRE {alert.tire}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono-val">
                    {alert.formatted_time}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-200 leading-snug">
                  {alert.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
