import { useState, useEffect, useRef, useCallback } from 'react';
import * as api from '../services/api';

const MAX_HISTORY_POINTS = 45;

const DEFAULT_SNAPSHOT = {
  tires: {
    FL: { id: 'FL', position: 'Front Left', current_pressure: 34.0, nominal_pressure: 34.0, temperature: 32.0, physical_temperature: 32.0, status: 'NORMAL', pressure_status: 'NORMAL', tire_physical_status: 'NORMAL', pressure_percentage: 100, pressure_loss: 0, sensor_status: 'ONLINE', sensor_health: 100.0, tire_health: 100.0, leak_enabled: false, leak_rate: 0, last_valid_reading_seconds_ago: 0 },
    FR: { id: 'FR', position: 'Front Right', current_pressure: 34.0, nominal_pressure: 34.0, temperature: 32.0, physical_temperature: 32.0, status: 'NORMAL', pressure_status: 'NORMAL', tire_physical_status: 'NORMAL', pressure_percentage: 100, pressure_loss: 0, sensor_status: 'ONLINE', sensor_health: 100.0, tire_health: 100.0, leak_enabled: false, leak_rate: 0, last_valid_reading_seconds_ago: 0 },
    RL: { id: 'RL', position: 'Rear Left', current_pressure: 34.0, nominal_pressure: 34.0, temperature: 32.0, physical_temperature: 32.0, status: 'NORMAL', pressure_status: 'NORMAL', tire_physical_status: 'NORMAL', pressure_percentage: 100, pressure_loss: 0, sensor_status: 'ONLINE', sensor_health: 100.0, tire_health: 100.0, leak_enabled: false, leak_rate: 0, last_valid_reading_seconds_ago: 0 },
    RR: { id: 'RR', position: 'Rear Right', current_pressure: 34.0, nominal_pressure: 34.0, temperature: 32.0, physical_temperature: 32.0, status: 'NORMAL', pressure_status: 'NORMAL', tire_physical_status: 'NORMAL', pressure_percentage: 100, pressure_loss: 0, sensor_status: 'ONLINE', sensor_health: 100.0, tire_health: 100.0, leak_enabled: false, leak_rate: 0, last_valid_reading_seconds_ago: 0 },
  },
  status: {
    state: 'RUNNING',
    elapsed_seconds: 0,
    simulated_minutes: 0,
    active_scenario: 'Slow Leak — RR',
    overall_status: 'NORMAL',
    sensors_online: '4 / 4',
    sensors_online_count: 4,
    tpms_system_health: 100.0,
    tire_health_score: 100.0,
    overall_tpms_health: 100.0,
    health_score: 100.0,
    digital_twin: { virtual_vehicle: 'CONNECTED', sensor_streams: '4 ACTIVE', simulation_engine: 'RUNNING', data_synchronization: 'LIVE', latency_ms: 3.2 }
  },
  settings: {
    nominal_pressure: 34.0,
    warning_threshold_ratio: 0.90,
    critical_threshold_ratio: 0.80,
    affected_tire: 'RR',
    leak_enabled: false,
    leak_rate: 0.05,
    time_multiplier: 1.0,
    noise_std: 0.09
  },
  telemetry: {
    speed_kmh: 70,
    ambient_temp_c: 28,
    drive_mode: 'COMFORT'
  },
  alerts: []
};

export function useSimulation() {
  const [snapshot, setSnapshot] = useState(DEFAULT_SNAPSHOT);
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isWs, setIsWs] = useState(false);
  const [latency, setLatency] = useState(3.5);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const pollTimerRef = useRef(null);
  const lastPacketTimeRef = useRef(Date.now());

  // Update history buffer from new snapshot
  const processSnapshot = useCallback((data) => {
    if (!data || !data.tires) return;
    setSnapshot(data);
    setError(null);
    setIsConnected(true);

    const now = Date.now();
    setLatency(Math.max(1, Math.round((now - lastPacketTimeRef.current) % 15 + 2)));
    lastPacketTimeRef.current = now;

    // Build chart point
    const t = data.status?.elapsed_seconds ?? 0;
    const timeLabel = `${Math.round(t)}s`;
    
    const warningPsi = data.settings?.nominal_pressure 
      ? Math.round(data.settings.nominal_pressure * data.settings.warning_threshold_ratio * 10) / 10 
      : 30.6;
    const criticalPsi = data.settings?.nominal_pressure 
      ? Math.round(data.settings.nominal_pressure * data.settings.critical_threshold_ratio * 10) / 10 
      : 27.2;

    const getPressureForChart = (tire) => {
      if (!tire || tire.sensor_status !== 'ONLINE') {
        return null;
      }
      return typeof tire.current_pressure === 'number' ? tire.current_pressure : null;
    };

    const newPoint = {
      timestamp: t,
      time: timeLabel,
      FL: getPressureForChart(data.tires.FL),
      FR: getPressureForChart(data.tires.FR),
      RL: getPressureForChart(data.tires.RL),
      RR: getPressureForChart(data.tires.RR),
      warning: warningPsi,
      critical: criticalPsi,
    };

    setHistory((prev) => {
      // Avoid duplicate timestamp additions
      if (prev.length > 0 && prev[prev.length - 1].timestamp === t) {
        return prev;
      }
      const updated = [...prev, newPoint];
      if (updated.length > MAX_HISTORY_POINTS) {
        return updated.slice(updated.length - MAX_HISTORY_POINTS);
      }
      return updated;
    });
  }, []);

  // WebSocket connection with automatic fallback to polling
  useEffect(() => {
    let unmounted = false;
    let ws = null;

    function connectWs() {
      const API_URL = import.meta.env.VITE_API_BASE_URL;

const wsProtocol = API_URL.startsWith('https://') ? 'wss://' : 'ws://';
const wsBaseUrl = API_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
const wsUrl = `${wsProtocol}${wsBaseUrl}/ws/simulation`;
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (unmounted) return;
          setIsConnected(true);
          setIsWs(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const data = JSON.parse(event.data);
            processSnapshot(data);
          } catch (e) {
            console.error('Failed to parse WS data:', e);
          }
        };

        ws.onerror = () => {
          if (unmounted) return;
          setIsWs(false);
        };

        ws.onclose = () => {
          if (unmounted) return;
          setIsWs(false);
          // Fall back to REST polling if WS fails
          startPolling();
        }
      } catch (err) {
        setIsWs(false);
        startPolling();
      }
    }

    function startPolling() {
      if (pollTimerRef.current) return;
      pollTimerRef.current = setInterval(async () => {
        if (unmounted) return;
        try {
          const data = await api.fetchSimulation();
          processSnapshot(data);
        } catch (err) {
          setIsConnected(false);
          setError('Backend telemetry service unreachable. Check if FastAPI server is running.');
        }
      }, 600);
    }

    connectWs();

    return () => {
      unmounted = true;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [processSnapshot]);

  // Actions
  const start = useCallback(async () => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'start' }));
      } else {
        await api.startSimulation();
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'pause' }));
      } else {
        await api.pauseSimulation();
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const reset = useCallback(async () => {
    try {
      setHistory([]);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'reset' }));
      } else {
        await api.resetSimulation();
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const changeScenario = useCallback(async (scenarioName, customRate = null) => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'scenario',
          scenario: scenarioName,
          leak_rate: customRate
        }));
      } else {
        await api.setScenario(scenarioName, customRate);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const changeConfig = useCallback(async (newConfig) => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'config',
          config: newConfig
        }));
      } else {
        await api.updateConfig(newConfig);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const triggerDemo = useCallback(async () => {
    setHistory([]);
    await changeScenario('demo');
  }, [changeScenario]);

  return {
    snapshot,
    history,
    isConnected,
    isWs,
    latency,
    error,
    start,
    pause,
    reset,
    setScenario: changeScenario,
    updateConfig: changeConfig,
    triggerDemo
  };
}
