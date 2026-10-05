from typing import Literal
from pydantic import BaseModel, Field


TireId = Literal["FL", "FR", "RL", "RR"]
TireStatus = Literal["NORMAL", "WARNING", "CRITICAL", "SENSOR FAULT"]
SensorStatus = Literal["ONLINE", "OFFLINE", "INVALID", "STALE"]


class TireState(BaseModel):
    id: TireId
    position: str
    nominal_pressure: float = Field(default=34.0, description="Nominal cold target pressure in PSI")
    current_pressure: float | None = Field(default=34.0, description="Real-time measured sensor pressure in PSI, None when OFFLINE")
    base_pressure: float = Field(default=34.0, description="Underlying physical pressure without sensor noise in PSI")
    temperature: float | None = Field(default=32.0, description="Measured cavity temperature in °C, None when OFFLINE")
    physical_temperature: float = Field(default=32.0, description="True underlying tire cavity temperature in °C")
    sensor_status: SensorStatus = Field(default="ONLINE", description="Hardware sensor telemetry status")
    sensor_health: float = Field(default=100.0, description="Individual sensor link health percentage 0-100%")
    tire_health: float = Field(default=100.0, description="Physical tire condition health percentage 0-100%")
    leak_enabled: bool = Field(default=False, description="Whether slow/fast leak fault injection is active")
    leak_rate: float = Field(default=0.0, description="Pressure drop rate in PSI/minute")
    status: TireStatus = Field(default="NORMAL", description="Combined tire/sensor status (NORMAL, WARNING, CRITICAL, SENSOR FAULT)")
    pressure_status: str = Field(default="NORMAL", description="Pneumatic threshold status: NORMAL, LOW PRESSURE, CRITICAL LOW, UNKNOWN")
    temperature_status: str = Field(default="NORMAL", description="Thermal threshold status: NORMAL, ELEVATED, OVERHEATING, SUB_ZERO")
    is_temperature_abnormal: bool = Field(default=False, description="True if tire temperature is outside safe normal operating envelope")
    tire_physical_status: str = Field(default="NORMAL", description="Physical tire structural condition: NORMAL, LOW PRESSURE, CRITICAL, UNKNOWN")
    pressure_percentage: float | None = Field(default=100.0, description="Current pressure as percentage of nominal, None if OFFLINE")
    pressure_loss: float = Field(default=0.0, description="Total PSI lost from nominal baseline")
    last_valid_pressure: float = Field(default=34.0, description="Last recorded valid pressure before telemetry drop")
    last_valid_temperature: float = Field(default=32.0, description="Last recorded valid cavity temp before telemetry drop")
    last_update_time: float = Field(default=0.0, description="Simulation timestamp of last successful sensor telemetry frame")
    last_valid_reading_seconds_ago: float = Field(default=0.0, description="Elapsed seconds since last valid reading received")
    timestamp: float = Field(default=0.0, description="Simulation elapsed seconds")


class TireUpdateConfig(BaseModel):
    tire_id: TireId
    leak_enabled: bool | None = None
    leak_rate: float | None = None
    nominal_pressure: float | None = None
    temperature: float | None = None
    sensor_status: SensorStatus | None = None
