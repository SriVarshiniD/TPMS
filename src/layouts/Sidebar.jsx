import React from 'react';
import { 
  LayoutDashboard, 
  CircleDot, 
  Car, 
  Sliders, 
  Settings, 
  Radio, 
  Activity, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tpms', label: 'TPMS Telemetry', icon: CircleDot },
  { id: 'vehicle', label: 'Vehicle Twin', icon: Car },
  { id: 'simulation', label: 'Simulation Lab', icon: Sliders },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onSelectTab, snapshot, isConnected }) {
  const twin = snapshot?.status?.digital_twin;
  const state = snapshot?.status?.state ?? 'RUNNING';

  return (
    <aside className="w-full lg:w-64 bg-[#090b14]/95 border-r border-purple-500/15 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400/80 px-3 mb-2 font-tech">
            Cockpit Systems
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.25)] font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Scenario Status */}
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20">
          <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-1 flex items-center justify-between">
            <span>Active Scenario</span>
            <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
          </div>
          <div className="text-xs font-bold text-slate-200">
            {snapshot?.status?.active_scenario ?? 'Slow Leak — RR'}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Simulated Time:</span>
            <span className="font-mono-val text-purple-300 font-semibold">
              {snapshot?.status?.simulated_minutes ?? 0} min
            </span>
          </div>
        </div>
      </div>

      {/* Digital Twin Status Card at Sidebar Bottom */}
      <div className="mt-6 p-3.5 rounded-xl bg-[#0d101e]/80 border border-purple-500/20 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 font-tech">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Digital Twin Node</span>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {isConnected ? 'SYNCED' : 'OFFLINE'}
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Virtual Vehicle:</span>
            <span className="text-emerald-400 font-semibold">{twin?.virtual_vehicle ?? 'CONNECTED'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Sensor Streams:</span>
            <span className="text-cyan-400 font-semibold">{twin?.sensor_streams ?? '4 ACTIVE'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Simulation Engine:</span>
            <span className={state === 'RUNNING' ? 'text-purple-300 font-semibold' : 'text-amber-400 font-semibold'}>
              {state}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Data Sync:</span>
            <span className="text-emerald-400 font-semibold">{twin?.data_synchronization ?? 'LIVE'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
