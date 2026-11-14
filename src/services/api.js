const API_BASE = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api`;
VITE_API_BASE_URL=https://tpms-backend-1rcx.onrender.com
export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchTires() {
  const res = await fetch(`${API_BASE}/tires`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchSimulation() {
  const res = await fetch(`${API_BASE}/simulation`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function startSimulation() {
  const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function pauseSimulation() {
  const res = await fetch(`${API_BASE}/simulation/pause`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function resetSimulation() {
  const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function setScenario(scenario, customLeakRate = null) {
  const res = await fetch(`${API_BASE}/simulation/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario,
      custom_leak_rate: customLeakRate
    })
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function updateConfig(config) {
  const res = await fetch(`${API_BASE}/simulation/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function updateTire(tireId, tireConfig) {
  const res = await fetch(`${API_BASE}/tires/${tireId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tireConfig)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function toggleSensor(tireId) {
  const res = await fetch(`${API_BASE}/tires/${tireId}/sensor-toggle`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}
