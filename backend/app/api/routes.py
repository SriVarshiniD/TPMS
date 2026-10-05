from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal

from ..simulation.engine import engine
from ..models.simulation import ScenarioRequest, SimulationSnapshot
from ..models.tire import TireId, TireUpdateConfig

router = APIRouter(prefix="/api")


class ConfigUpdateRequest(BaseModel):
    nominal_pressure: float | None = None
    warning_threshold_ratio: float | None = None
    critical_threshold_ratio: float | None = None
    hysteresis_psi: float | None = None
    affected_tire: str | None = None
    leak_enabled: bool | None = None
    leak_rate: float | None = None
    noise_std: float | None = None
    update_interval_sec: float | None = None
    time_multiplier: float | None = None
    vehicle_speed_kmh: float | None = None
    ambient_temp_c: float | None = None
    drive_mode: str | None = None
    sensor_status: dict[str, str] | None = None
    sensor_toggle: str | None = None
    tire_temperatures: dict[str, float | None] | None = None
    reset_temperatures: bool | None = None
    reset_sensors: bool | None = None


@router.get("/status")
def get_status():
    """Returns general digital twin and system status."""
    snapshot = engine.tick(0.0)
    return {
        "status": snapshot.status,
        "telemetry": snapshot.telemetry,
        "overall_status": snapshot.status.overall_status,
        "health_score": snapshot.status.health_score,
        "digital_twin": snapshot.status.digital_twin
    }


@router.get("/tires")
def get_tires():
    """Returns all 4 tire states."""
    snapshot = engine.tick(0.0)
    return snapshot.tires


@router.get("/simulation", response_model=SimulationSnapshot)
def get_simulation():
    """Returns full current simulation snapshot."""
    return engine.tick(0.0)


@router.get("/alerts")
def get_alerts():
    """Returns list of recent threshold/system alerts."""
    return engine.alerts


@router.post("/simulation/start")
def start_simulation():
    engine.start()
    return {"message": "Simulation started", "state": engine.run_state}


@router.post("/simulation/pause")
def pause_simulation():
    engine.pause()
    return {"message": "Simulation paused", "state": engine.run_state}


@router.post("/simulation/reset")
def reset_simulation():
    engine.reset()
    return {"message": "Simulation reset", "state": engine.run_state}


@router.post("/simulation/scenario")
def set_scenario(req: ScenarioRequest):
    valid_scenarios = ["normal", "slow_leak_rr", "slow_leak_fl", "rapid_leak_rr", "demo", "reset"]
    if req.scenario not in valid_scenarios:
        raise HTTPException(status_code=400, detail=f"Invalid scenario. Choose from: {valid_scenarios}")
    
    if req.scenario == "reset":
        engine.reset()
    else:
        engine.set_scenario(req.scenario, custom_rate=req.custom_leak_rate)
        
    return {
        "message": f"Scenario set to {engine.active_scenario}",
        "scenario": engine.active_scenario,
        "affected_tire": engine.settings.affected_tire,
        "leak_enabled": engine.settings.leak_enabled,
        "leak_rate": engine.settings.leak_rate
    }


@router.post("/simulation/config")
def update_config(req: ConfigUpdateRequest):
    updates = req.model_dump(exclude_none=True)
    engine.update_settings(updates)
    return {
        "message": "Configuration updated successfully",
        "settings": engine.settings
    }


@router.post("/settings")
def update_settings(req: ConfigUpdateRequest):
    """Alias for /simulation/config."""
    return update_config(req)


@router.post("/tires/{tire_id}")
def update_tire(tire_id: TireId, req: TireUpdateConfig):
    if tire_id not in engine.tires:
        raise HTTPException(status_code=404, detail=f"Tire {tire_id} not found")
    tire = engine.tires[tire_id]
    if req.leak_enabled is not None:
        tire.set_leak(req.leak_enabled, req.leak_rate)
    if req.nominal_pressure is not None:
        tire.nominal_pressure = req.nominal_pressure
    if req.temperature is not None:
        tire.set_temperature(req.temperature)
    if req.sensor_status is not None:
        tire.set_sensor_status(req.sensor_status)
    return {
        "message": f"Tire {tire_id} configuration updated successfully",
        "tire_id": tire_id,
        "sensor_status": tire.sensor_status,
        "temperature": tire.temperature
    }


@router.post("/tires/{tire_id}/sensor-toggle")
def toggle_sensor(tire_id: TireId):
    if tire_id not in engine.tires:
        raise HTTPException(status_code=404, detail=f"Tire {tire_id} not found")
    curr = engine.tires[tire_id].sensor_status
    new_st = "OFFLINE" if curr == "ONLINE" else "ONLINE"
    engine.tires[tire_id].set_sensor_status(new_st)
    return {
        "message": f"Tire {tire_id} sensor status changed to {new_st}",
        "tire_id": tire_id,
        "sensor_status": new_st
    }
