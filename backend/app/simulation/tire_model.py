from ..models.tire import TireState, TireStatus, TireId, SensorStatus
from .noise import SensorNoiseGenerator
from .leak import LeakModel
from ..config import SimulationSettings

POSITION_OFFSETS: dict[str, float] = {
    "FL": 0.4,
    "FR": 0.1,
    "RL": 0.7,
    "RR": 1.2,
}

DRIVE_MODE_PARAMS: dict[str, dict[str, float]] = {
    "COMFORT": {"heat_mult": 1.0, "alpha_mult": 1.0, "noise_mult": 1.0},
    "SPORT": {"heat_mult": 1.25, "alpha_mult": 1.4, "noise_mult": 1.25},
    "ECO": {"heat_mult": 0.80, "alpha_mult": 0.75, "noise_mult": 0.80},
    "SDV-TWIN": {"heat_mult": 1.10, "alpha_mult": 1.1, "noise_mult": 1.05},
}


class VirtualTire:
    """
    Virtual Digital Twin representation of a single automotive tire.
    Models thermodynamic convergence, ideal gas law pneumatic expansion,
    friction deflection heating, sensor telemetry noise, and telemetry link availability.
    """
    def __init__(
        self,
        tire_id: TireId,
        position: str,
        nominal_pressure: float = 34.0,
        leak_enabled: bool = False,
        leak_rate: float = 0.05,
        initial_temp: float = 32.0
    ):
        self.tire_id: TireId = tire_id
        self.position: str = position
        self.nominal_pressure: float = nominal_pressure
        self.base_pressure: float = nominal_pressure
        self.physical_temperature: float = initial_temp + POSITION_OFFSETS.get(tire_id, 0.0)
        self.sensor_status: SensorStatus = "ONLINE"
        self._prev_sensor_status: SensorStatus = "ONLINE"
        self.manual_temp_override: float | None = None

        self.leak_enabled: bool = leak_enabled
        self.leak_rate: float = leak_rate
        self.leak_model: LeakModel = LeakModel(leak_rate)
        self.pressure_loss: float = 0.0
        self.elapsed_leak_seconds: float = 0.0

        self.status: TireStatus = "NORMAL"
        self.pressure_status: str = "NORMAL"
        self.temperature_status: str = "NORMAL"
        self._prev_temperature_status: str = "NORMAL"
        self.tire_physical_status: str = "NORMAL"
        self.timestamp: float = 0.0

        self.last_valid_pressure: float = nominal_pressure
        self.last_valid_temperature: float = self.physical_temperature
        self.last_update_time: float = 0.0
        self.last_valid_reading_seconds_ago: float = 0.0

    def reset(self, nominal_pressure: float | None = None, ambient_temp: float = 28.0):
        """Reset tire to pristine factory nominal state."""
        if nominal_pressure is not None:
            self.nominal_pressure = nominal_pressure
        self.physical_temperature = ambient_temp + 2.5 + POSITION_OFFSETS.get(self.tire_id, 0.0)
        self.base_pressure = self.nominal_pressure
        self.status = "NORMAL"
        self.pressure_status = "NORMAL"
        self.temperature_status = "NORMAL"
        self._prev_temperature_status = "NORMAL"
        self.tire_physical_status = "NORMAL"
        self.pressure_loss = 0.0
        self.elapsed_leak_seconds = 0.0
        self.timestamp = 0.0
        self.sensor_status = "ONLINE"
        self._prev_sensor_status = "ONLINE"
        self.manual_temp_override = None
        self.last_valid_pressure = self.nominal_pressure
        self.last_valid_temperature = self.physical_temperature
        self.last_update_time = 0.0
        self.last_valid_reading_seconds_ago = 0.0

    def set_sensor_status(self, status: str):
        st = status.upper()
        if st in ("ONLINE", "OFFLINE", "INVALID", "STALE"):
            self.sensor_status = st  # type: ignore
        else:
            self.sensor_status = "ONLINE"

    def set_temperature(self, temp: float | None):
        self.manual_temp_override = temp

    def set_leak(self, enabled: bool, rate: float | None = None):
        self.leak_enabled = enabled
        if not enabled:
            self.elapsed_leak_seconds = 0.0
            self.pressure_loss = 0.0
            self.leak_rate = 0.0
            self.status = "NORMAL"
            self.pressure_status = "NORMAL"
            self.tire_physical_status = "NORMAL"
        else:
            if rate is not None:
                self.leak_rate = max(0.0, rate)
                self.leak_model = LeakModel(self.leak_rate)

    def step(
        self,
        dt_simulated_seconds: float,
        noise_gen: SensorNoiseGenerator,
        settings: SimulationSettings,
        ambient_temp: float,
        vehicle_speed_kmh: float,
        drive_mode: str = "COMFORT"
    ) -> tuple[TireState, str | None]:
        """
        Advance tire digital twin state by dt_simulated_seconds.
        Calculates:
          1. Thermal convergence based on speed, drive mode, ambient, and position offset.
          2. Pressure calculation via Ideal Gas Law (P1/T1 = P2/T2).
          3. Independent slow leak extraction.
          4. Speed and drive-mode scaled sensor telemetry noise.
          5. Sensor availability / link state gating (None/UNKNOWN when offline).
        """
        self.timestamp += dt_simulated_seconds
        mode_params = DRIVE_MODE_PARAMS.get(drive_mode.upper(), DRIVE_MODE_PARAMS["COMFORT"])

        # Sensor status state transition alert
        transition_alert: str | None = None
        if self.sensor_status != self._prev_sensor_status:
            if self.sensor_status == "OFFLINE":
                transition_alert = f"⚠ {self.position} ({self.tire_id}) TPMS SENSOR OFFLINE — Telemetry link lost"
            elif self.sensor_status == "ONLINE":
                transition_alert = f"Telemetry restored: {self.position} ({self.tire_id}) sensor returned ONLINE"
            elif self.sensor_status == "STALE":
                transition_alert = f"⚠ {self.position} ({self.tire_id}) TPMS SENSOR STALE — No fresh telemetry"
            self._prev_sensor_status = self.sensor_status

        # -------------------------------------------------------------
        # 1. Thermal Convergence Model (Sections 1, 2, 5, 6)
        # -------------------------------------------------------------
        # T_target = Ambient_Temperature + Base_Heat + Speed_Heat + Position_Offset
        # Speed_Heat = k_speed * (VehicleSpeed / 100)^2 * heat_mult
        k_speed = 6.5
        speed_ratio = vehicle_speed_kmh / 100.0
        speed_heat = k_speed * (speed_ratio ** 2) * mode_params["heat_mult"]
        base_heat = 2.5
        pos_offset = POSITION_OFFSETS.get(self.tire_id, 0.0)

        target_temp = ambient_temp + base_heat + speed_heat + pos_offset

        if self.manual_temp_override is not None:
            self.physical_temperature = round(self.manual_temp_override, 1)
        else:
            # Gradual convergence: T_new = T_old + alpha * (T_target - T_old)
            # alpha is scaled per simulated second: ~0.08 / sec
            if dt_simulated_seconds > 0:
                alpha = min(1.0, 0.09 * mode_params["alpha_mult"] * dt_simulated_seconds)
                self.physical_temperature += alpha * (target_temp - self.physical_temperature)
            self.physical_temperature = round(self.physical_temperature, 2)

        # -------------------------------------------------------------
        # 2. Ideal Gas Relationship (Section 3)
        # -------------------------------------------------------------
        # P1 / T1 = P2 / T2 in Kelvin
        # T_ref = 20.0°C (293.15 K), P_ref = nominal_pressure
        t_ref_k = 293.15
        t_current_k = max(200.0, self.physical_temperature + 273.15)
        p_temperature = self.nominal_pressure * (t_current_k / t_ref_k)
        # Physical sanity clamps: prevent unrealistic extreme pressure spikes
        p_temperature = max(self.nominal_pressure * 0.65, min(self.nominal_pressure * 1.45, p_temperature))

        # -------------------------------------------------------------
        # 3. Independent Slow Leak Model (Section 4)
        # -------------------------------------------------------------
        if self.leak_enabled and self.leak_rate > 0.0:
            self.elapsed_leak_seconds += dt_simulated_seconds
            self.pressure_loss = self.leak_model.compute_loss(self.elapsed_leak_seconds)
            effective_base = max(0.0, p_temperature - self.pressure_loss)
        else:
            self.pressure_loss = 0.0
            effective_base = p_temperature

        self.base_pressure = round(effective_base, 2)

        # -------------------------------------------------------------
        # 4. Sensor Telemetry Noise (Section 1 & 5)
        # -------------------------------------------------------------
        # High speed induces greater tire/wheel vibration noise
        noise_speed_factor = 1.0 + (vehicle_speed_kmh / 100.0) * 0.35
        effective_noise_std = settings.noise_std * noise_speed_factor * mode_params["noise_mult"]
        noise = noise_gen.sample(effective_noise_std)
        measured_pressure = max(0.0, round(effective_base + noise, 2))
        temp_noise = noise_gen.sample(0.04)
        measured_temp = round(self.physical_temperature + temp_noise, 1)

        # -------------------------------------------------------------
        # 5. Threshold Detection on Physical Condition (Sections 8, 9, 10)
        # -------------------------------------------------------------
        warning_thresh = settings.warning_threshold_psi
        critical_thresh = settings.critical_threshold_psi
        hysteresis = settings.hysteresis_psi

        old_physical_status = self.tire_physical_status
        new_physical_status = self._evaluate_status(
            pressure=effective_base,
            old_status=old_physical_status if old_physical_status in ("NORMAL", "WARNING", "CRITICAL") else "NORMAL",
            warning_thresh=warning_thresh,
            critical_thresh=critical_thresh,
            hysteresis=hysteresis
        )

        # Thermal threshold classification
        temp_val = self.physical_temperature
        if temp_val >= 70.0:
            thermal_status = "OVERHEATING"
            is_temp_abnormal = True
        elif temp_val >= 50.0:
            thermal_status = "ELEVATED"
            is_temp_abnormal = True
        elif temp_val <= 0.0:
            thermal_status = "SUB_ZERO"
            is_temp_abnormal = True
        else:
            thermal_status = "NORMAL"
            is_temp_abnormal = False
        self.temperature_status = thermal_status

        # Combine pressure and temperature into physical tire condition
        if thermal_status == "OVERHEATING":
            new_physical_status = "CRITICAL"
        elif thermal_status in ("ELEVATED", "SUB_ZERO") and new_physical_status == "NORMAL":
            new_physical_status = "WARNING"
        self.tire_physical_status = new_physical_status

        # -------------------------------------------------------------
        # 6. Physical Tire Health Calculation (Section 8)
        # -------------------------------------------------------------
        # Based on pressure deviation vs nominal and threshold penalties
        pct = (effective_base / self.nominal_pressure) * 100.0 if self.nominal_pressure > 0 else 100.0
        if new_physical_status == "CRITICAL":
            tire_health = max(10.0, min(50.0, pct * 0.55))
        elif new_physical_status == "WARNING":
            tire_health = max(55.0, min(79.0, pct * 0.78))
        else:
            tire_health = max(80.0, min(100.0, 100.0 - abs(100.0 - pct) * 1.4))

        # Thermal degradation penalty on tire health
        if thermal_status == "OVERHEATING":
            tire_health = min(tire_health, max(15.0, 58.0 - (temp_val - 70.0) * 1.5))
        elif thermal_status == "ELEVATED":
            tire_health = min(tire_health, 78.0)
        elif thermal_status == "SUB_ZERO":
            tire_health = min(tire_health, 82.0)
        tire_health = round(tire_health, 1)

        # -------------------------------------------------------------
        # 7. Sensor Gating (Sections 7, 8, 9, 10, 15)
        # -------------------------------------------------------------
        is_sensor_online = self.sensor_status == "ONLINE"

        if is_sensor_online:
            self.last_valid_pressure = measured_pressure
            self.last_valid_temperature = measured_temp
            self.last_update_time = self.timestamp
            self.last_valid_reading_seconds_ago = 0.0

            current_pressure_out: float | None = measured_pressure
            temperature_out: float | None = measured_temp
            pressure_percentage_out: float | None = round((measured_pressure / self.nominal_pressure) * 100.0, 1) if self.nominal_pressure > 0 else 0.0
            self.pressure_status = self._evaluate_status(
                pressure=measured_pressure,
                old_status=self.pressure_status if self.pressure_status in ("NORMAL", "WARNING", "CRITICAL") else "NORMAL",
                warning_thresh=warning_thresh,
                critical_thresh=critical_thresh,
                hysteresis=hysteresis
            )
            self.status = new_physical_status
            sensor_health = 100.0

            # Alert dispatch for threshold crossing when online
            if not transition_alert and new_physical_status != old_physical_status:
                if new_physical_status == "WARNING" and old_physical_status == "NORMAL":
                    transition_alert = f"⚠ {self.position} ({self.tire_id}) pressure dropped below warning threshold ({warning_thresh} PSI)"
                elif new_physical_status == "CRITICAL" and old_physical_status != "CRITICAL":
                    transition_alert = f"🚨 CRITICAL: {self.position} ({self.tire_id}) pressure dropped below critical threshold ({critical_thresh} PSI)"
                elif new_physical_status == "NORMAL" and old_physical_status in ("WARNING", "CRITICAL"):
                    transition_alert = f"Telemetry normal: {self.position} ({self.tire_id}) pressure restored to nominal range"

            # Alert dispatch for thermal threshold crossing
            if not transition_alert and thermal_status != self._prev_temperature_status:
                if thermal_status == "OVERHEATING":
                    transition_alert = f"🚨 CRITICAL: {self.position} ({self.tire_id}) tire cavity overheating ({measured_temp}°C) — Blowout hazard!"
                elif thermal_status == "ELEVATED" and self._prev_temperature_status == "NORMAL":
                    transition_alert = f"⚠ WARNING: {self.position} ({self.tire_id}) elevated tire cavity temperature ({measured_temp}°C)"
                elif thermal_status == "SUB_ZERO" and self._prev_temperature_status == "NORMAL":
                    transition_alert = f"❄ CAUTION: {self.position} ({self.tire_id}) sub-zero tire cavity temperature ({measured_temp}°C) — Cold grip warning"
                elif thermal_status == "NORMAL" and self._prev_temperature_status in ("OVERHEATING", "ELEVATED", "SUB_ZERO"):
                    transition_alert = f"Thermal normal: {self.position} ({self.tire_id}) cavity temperature normalized ({measured_temp}°C)"
                self._prev_temperature_status = thermal_status
        else:
            # Sensor is OFFLINE or STALE: DO NOT INVENT MEASUREMENTS!
            self.last_valid_reading_seconds_ago += dt_simulated_seconds
            current_pressure_out = None
            temperature_out = None
            pressure_percentage_out = None
            self.pressure_status = "UNKNOWN"
            self.status = "SENSOR FAULT"
            sensor_health = 0.0 if self.sensor_status == "OFFLINE" else 40.0

        state = TireState(
            id=self.tire_id,
            position=self.position,
            nominal_pressure=self.nominal_pressure,
            current_pressure=current_pressure_out,
            base_pressure=self.base_pressure,
            temperature=temperature_out,
            physical_temperature=round(self.physical_temperature, 1),
            sensor_status=self.sensor_status,
            sensor_health=sensor_health,
            tire_health=tire_health,
            leak_enabled=self.leak_enabled,
            leak_rate=self.leak_rate,
            status=self.status,
            pressure_status=self.pressure_status,
            temperature_status=self.temperature_status,
            is_temperature_abnormal=is_temp_abnormal,
            tire_physical_status=self.tire_physical_status,
            pressure_percentage=pressure_percentage_out,
            pressure_loss=round(self.pressure_loss, 2),
            last_valid_pressure=self.last_valid_pressure,
            last_valid_temperature=self.last_valid_temperature,
            last_update_time=round(self.last_update_time, 1),
            last_valid_reading_seconds_ago=round(self.last_valid_reading_seconds_ago, 1),
            timestamp=round(self.timestamp, 1)
        )
        return state, transition_alert

    def _evaluate_status(
        self,
        pressure: float,
        old_status: str,
        warning_thresh: float,
        critical_thresh: float,
        hysteresis: float
    ) -> str:
        """Evaluate status using hysteresis to prevent state fluttering."""
        if old_status == "NORMAL":
            if pressure < critical_thresh:
                return "CRITICAL"
            elif pressure < warning_thresh:
                return "WARNING"
            return "NORMAL"
        elif old_status == "WARNING":
            if pressure < critical_thresh:
                return "CRITICAL"
            elif pressure >= (warning_thresh + hysteresis):
                return "NORMAL"
            return "WARNING"
        else:  # CRITICAL
            if pressure >= (warning_thresh + hysteresis):
                return "NORMAL"
            elif pressure >= (critical_thresh + hysteresis):
                return "WARNING"
            return "CRITICAL"
