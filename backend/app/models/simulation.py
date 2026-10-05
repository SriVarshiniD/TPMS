from typing import Literal
from pydantic import BaseModel, Field
from .tire import TireState
from ..config import SimulationSettings

SimulationRunState = Literal["RUNNING", "PAUSED", "STOPPED"]
AlertSeverity = Literal["INFO", "WARNING", "CRITICAL"]
OverallHealthStatus = Literal["NORMAL", "ATTENTION REQUIRED", "CRITICAL"]


class Alert(BaseModel):
    id: str
    severity: AlertSeverity
    message: str
    tire: str | None = None
    timestamp: float
    formatted_time: str


class DigitalTwinStatus(BaseModel):
    virtual_vehicle: str = "CONNECTED"
    sensor_streams: str = "4 ACTIVE"
    simulation_engine: str = "RUNNING"
    data_synchronization: str = "LIVE"
    latency_ms: float = 4.2


class SimulationStatus(BaseModel):
    state: SimulationRunState = "RUNNING"
    elapsed_seconds: float = 0.0
    simulated_minutes: float = 0.0
    active_scenario: str = "Slow Leak — RR"
    overall_status: OverallHealthStatus = "NORMAL"
    sensors_online: str = "4 / 4"
    sensors_online_count: int = 4
    tpms_system_health: float = Field(default=100.0, description="TPMS monitoring sensor availability score (0-100%)")
    tire_health_score: float = Field(default=100.0, description="Average physical tire condition health score (0-100%)")
    overall_tpms_health: float = Field(default=100.0, description="Weighted composite score: 0.70*TireHealth + 0.30*SensorHealth")
    health_score: float = Field(default=100.0, description="Overall health score for backward compatibility")
    digital_twin: DigitalTwinStatus = Field(default_factory=DigitalTwinStatus)


class VehicleTelemetry(BaseModel):
    speed_kmh: float = 70.0
    ambient_temp_c: float = 28.0
    drive_mode: str = "COMFORT"
    odometer_km: float = 12450.0


class SimulationSnapshot(BaseModel):
    tires: dict[str, TireState]
    status: SimulationStatus
    alerts: list[Alert]
    settings: SimulationSettings
    telemetry: VehicleTelemetry
    timestamp: float


class ScenarioRequest(BaseModel):
    scenario: Literal["normal", "slow_leak_rr", "slow_leak_fl", "rapid_leak_rr", "demo", "reset"]
    custom_leak_rate: float | None = None
