import React, { useState } from 'react';
import Header from './layouts/Header';
import Sidebar from './layouts/Sidebar';
import OverviewPage from './pages/OverviewPage';
import TpmsPage from './pages/TpmsPage';
import VehiclePage from './pages/VehiclePage';
import SimulationPage from './pages/SimulationPage';
import SettingsPage from './pages/SettingsPage';
import TireDetailsModal from './components/TireDetailsModal';
import { useSimulation } from './hooks/useSimulation';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTireId, setSelectedTireId] = useState(null);

  const {
    snapshot,
    history,
    isConnected,
    isWs,
    latency,
    error,
    start,
    pause,
    reset,
    setScenario,
    updateConfig,
    triggerDemo
  } = useSimulation();

  const handleSelectTire = (tireId) => {
    setSelectedTireId(tireId);
  };

  const handleCloseModal = () => {
    setSelectedTireId(null);
  };

  const handleToggleLeak = (tireId, shouldEnable) => {
    updateConfig({
      affected_tire: tireId,
      leak_enabled: shouldEnable,
      leak_rate: shouldEnable ? 0.05 : 0.0
    });
  };

  const selectedTire = selectedTireId && snapshot?.tires ? snapshot.tires[selectedTireId] : null;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      {/* Top Cockpit Header */}
      <Header
        snapshot={snapshot}
        isConnected={isConnected}
        isWs={isWs}
        latency={latency}
        onStart={start}
        onPause={pause}
        onReset={reset}
        onDemo={triggerDemo}
        onUpdateConfig={updateConfig}
      />

      {/* Backend Disconnection Banner if server down */}
      {!isConnected && (
        <div className="w-full bg-red-600/90 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 animate-bounce" />
            <span>Telemetry Disconnected: FastAPI simulation backend not detected on http://127.0.0.1:8000. Reconnecting...</span>
          </div>
          <span className="text-[11px] font-mono-val opacity-80">Check terminal / start backend server</span>
        </div>
      )}

      {/* Main Cockpit Layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          snapshot={snapshot}
          isConnected={isConnected}
        />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-65px)]">
          {activeTab === 'overview' && (
            <OverviewPage
              snapshot={snapshot}
              history={history}
              selectedTireId={selectedTireId}
              onSelectTire={handleSelectTire}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSetScenario={setScenario}
              onUpdateConfig={updateConfig}
              onDemo={triggerDemo}
            />
          )}

          {activeTab === 'tpms' && (
            <TpmsPage
              snapshot={snapshot}
              history={history}
              selectedTireId={selectedTireId}
              onSelectTire={handleSelectTire}
            />
          )}

          {activeTab === 'vehicle' && (
            <VehiclePage
              snapshot={snapshot}
              selectedTireId={selectedTireId}
              onSelectTire={handleSelectTire}
            />
          )}

          {activeTab === 'simulation' && (
            <SimulationPage
              snapshot={snapshot}
              history={history}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSetScenario={setScenario}
              onUpdateConfig={updateConfig}
              onDemo={triggerDemo}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              snapshot={snapshot}
              onUpdateConfig={updateConfig}
            />
          )}
        </main>
      </div>

      {/* Selected Tire Diagnostics Modal */}
      {selectedTire && (
        <TireDetailsModal
          tire={selectedTire}
          onClose={handleCloseModal}
          onToggleLeak={handleToggleLeak}
          isAffected={snapshot?.settings?.affected_tire === selectedTire.id}
          onUpdateConfig={updateConfig}
        />
      )}
    </div>
  );
}
