from pydantic import BaseModel, Field


class SimulationSettings(BaseModel):
    # Pressure parameters
    nominal_pressure: float = Field(default=34.0, ge=20.0, le=50.0, description="Nominal tire pressure in PSI")
    warning_threshold_ratio: float = Field(default=0.90, ge=0.5, le=0.99, description="Warning threshold ratio (e.g. 0.90 = 90% = 30.6 PSI)")
    critical_threshold_ratio: float = Field(default=0.80, ge=0.4, le=0.95, description="Critical threshold ratio (e.g. 0.80 = 80% = 27.2 PSI)")
    hysteresis_psi: float = Field(default=0.25, ge=0.0, le=1.0, description="Hysteresis to prevent noise flicker near thresholds")
    
    # Fault injection defaults
    affected_tire: str = Field(default="RR", description="Tire with active leak injection (FL, FR, RL, RR)")
    leak_enabled: bool = Field(default=True, description="Whether leak injection is active")
    leak_rate: float = Field(default=0.05, ge=0.0, le=5.0, description="Leak rate in PSI per simulated minute")
    
    # Noise model
    noise_std: float = Field(default=0.09, ge=0.0, le=1.0, description="Gaussian noise standard deviation in PSI")
    
    # Timing and physics
    update_interval_sec: float = Field(default=0.5, ge=0.1, le=5.0, description="Real-time broadcast/tick interval in seconds")
    time_multiplier: float = Field(default=1.0, ge=0.1, le=50.0, description="Simulation speed factor (1.0 = real-time, 10.0 = 1s represents 10s)")
    
    # Environmental telemetry
    vehicle_speed_kmh: float = Field(default=70.0, ge=0.0, le=250.0, description="Vehicle velocity in km/h")
    ambient_temp_c: float = Field(default=28.0, ge=-20.0, le=60.0, description="Outside ambient temperature in °C")
    drive_mode: str = Field(default="COMFORT", description="SDV Drive mode (ECO, COMFORT, SPORT, SDV-TWIN)")

    @property
    def warning_threshold_psi(self) -> float:
        return round(self.nominal_pressure * self.warning_threshold_ratio, 2)

    @property
    def critical_threshold_psi(self) -> float:
        return round(self.nominal_pressure * self.critical_threshold_ratio, 2)


# Global default configuration instance
default_settings = SimulationSettings()
