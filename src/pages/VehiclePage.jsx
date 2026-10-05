import React from 'react';
import { Car, Cpu, Radio, Shield, Zap, Activity, Info, Gauge, Thermometer } from 'lucide-react';
import VehicleView from '../vehicle/VehicleView';

export default function VehiclePage({ snapshot, selectedTireId, onSelectTire }) {
  const twin = snapshot?.status?.digital_twin;
  const telemetry = snapshot?.telemetry;
  const tires = snapshot?.tires ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 lg:p-5 rounded-2xl glass-panel-purple border border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-tech uppercase tracking-wider flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-400" />
            <span>Vehicle Chassis & Digital Twin Network</span>
          </h2>
          <p className="text-xs text-purple-300/70 mt-1 font-medium">
            Software-Defined Vehicle Central Gateway • CAN-FD / Automotive Ethernet Virtual Bus Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            ECU Architecture: AUTOSAR Adaptive
          </span>
        </div>
      </div>

      {/* Vehicle Showcase */}
      <VehicleView
        tires={tires}
        selectedTireId={selectedTireId}
        onSelectTire={onSelectTire}
        affectedTireId={snapshot?.settings?.affected_tire}
      />

      {/* SDV Digital Twin Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gateway Telemetry */}
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-2 text-purple-300 font-tech font-bold text-xs uppercase">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Central SDV Gateway</span>
          </div>
          <div className="space-y-2 text-xs font-mono-val">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Node Status:</span>
              <span className="text-emerald-400 font-bold">ONLINE (MASTER)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Virtual CAN-FD Bus:</span>
              <span className="text-cyan-400">5.0 Mbps Sync</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Packet Drop Rate:</span>
              <span className="text-emerald-400 font-bold">0.00%</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Twin Loop Latency:</span>
              <span className="text-purple-300 font-bold">{twin?.latency_ms ?? 3.2} ms</span>
            </div>
          </div>
        </div>

        {/* Chassis Dynamics */}
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-tech font-bold text-xs uppercase">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Chassis Kinematics</span>
          </div>
          <div className="space-y-2 text-xs font-mono-val">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Vehicle Speed:</span>
              <span className="text-white font-bold">{telemetry?.speed_kmh ?? 70} km/h</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Ambient Temperature:</span>
              <span className="text-white font-bold">{telemetry?.ambient_temp_c ?? 28}°C</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Drive Mode:</span>
              <span className="text-purple-300 font-bold">{telemetry?.drive_mode ?? 'SDV-TWIN'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Virtual Odometer:</span>
              <span className="text-slate-300">12,450.4 km</span>
            </div>
          </div>
        </div>

        {/* Predictive Tire Life */}
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-2 text-emerald-300 font-tech font-bold text-xs uppercase">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Predictive Maintenance</span>
          </div>
          <div className="space-y-2 text-xs font-mono-val">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Tread Depth Remaining:</span>
              <span className="text-emerald-400 font-bold">7.2 mm (Good)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">TPMS Sensor Battery:</span>
              <span className="text-emerald-400 font-bold">96% (CR2032)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Rolling Resistance Index:</span>
              <span className="text-cyan-300">1.04 C_rr</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Next Service Interval:</span>
              <span className="text-purple-300">10,000 km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
