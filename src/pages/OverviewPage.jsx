import React from 'react';
import VehicleView from '../vehicle/VehicleView';
import LivePressureChart from '../charts/LivePressureChart';
import SimulationControls from '../simulation/SimulationControls';
import SystemStatusPanel from '../components/SystemStatusPanel';
import AlertsPanel from '../components/AlertsPanel';

export default function OverviewPage({
  snapshot,
  history,
  selectedTireId,
  onSelectTire,
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
      {/* Top Visual Centerpiece: Vehicle 3D Garage / Blueprint View with 4 Floating Callouts */}
      <section>
        <VehicleView
          tires={snapshot?.tires}
          selectedTireId={selectedTireId}
          onSelectTire={onSelectTire}
          affectedTireId={snapshot?.settings?.affected_tire}
        />
      </section>

      {/* Middle Row: Live Multi-Stream Pressure Chart + Simulation Controls */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <LivePressureChart
            history={history}
            warningThreshold={warningThresh}
            criticalThreshold={criticalThresh}
            nominalPressure={settings?.nominal_pressure ?? 34.0}
            isLive={isRunning}
            tires={snapshot?.tires}
          />
        </div>

        <div className="lg:col-span-5">
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
      </section>

      {/* Bottom Row: System Status & Health Metrics + Diagnostic Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6">
          <SystemStatusPanel snapshot={snapshot} />
        </div>

        <div className="lg:col-span-6">
          <AlertsPanel alerts={snapshot?.alerts} />
        </div>
      </section>
    </div>
  );
}
