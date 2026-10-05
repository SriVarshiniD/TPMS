import asyncio
import time
import uuid
from datetime import datetime
from typing import Callable

from ..models.tire import TireId, TireState
from ..models.simulation import (
    Alert,
    AlertSeverity,
    DigitalTwinStatus,
    SimulationSnapshot,
    SimulationStatus,
    VehicleTelemetry,
)
from ..config import SimulationSettings, default_settings
from .noise import SensorNoiseGenerator
from .tire_model import VirtualTire


class SimulationEngine:
    """
    Central Digital Twin Simulation Engine.
    Coordinates four virtual tire telemetry streams, time scaling,
    asynchronous tick loops, threshold evaluation, and alert dispatch.
    """
    def __init__(self, settings: SimulationSettings | None = None):
        self.settings: SimulationSettings = settings or default_settings.model_copy()
        self.noise_generator: SensorNoiseGenerator = SensorNoiseGenerator(std_dev=self.settings.noise_std)
        
        # Instantiate 4 digital twin tires
        self.tires: dict[TireId, VirtualTire] = {
            "FL": VirtualTire("FL", "Front Left", nominal_pressure=self.settings.nominal_pressure, leak_enabled=False),
            "FR": VirtualTire("FR", "Front Right", nominal_pressure=self.settings.nominal_pressure, leak_enabled=False),
            "RL": VirtualTire("RL", "Rear Left", nominal_pressure=self.settings.nominal_pressure, leak_enabled=False),
            "RR": VirtualTire("RR", "Rear Right", nominal_pressure=self.settings.nominal_pressure, 
                             leak_enabled=self.settings.leak_enabled, leak_rate=self.settings.leak_rate),
        }
        
        self.run_state: str = "RUNNING"
        self.elapsed_real_seconds: float = 0.0
        self.elapsed_simulated_seconds: float = 0.0
        self.active_scenario: str = "Slow Leak — Rear Right"
        self.alerts: list[Alert] = []
        self._max_alerts: int = 50
        
        # Subscribers for WebSocket streaming
        self._subscribers: set[asyncio.Queue] = set()
        self._loop_task: asyncio.Task | None = None
        self._last_tick_time: float = time.monotonic()
        
        # Initial boot alert
        self.add_alert(
            severity="INFO",
            message="TPMS Digital Twin initialized. 4 virtual sensor streams active.",
            tire=None
        )
        if self.settings.leak_enabled:
            self.add_alert(
                severity="INFO",
                message=f"Slow leak fault injected on {self.tires[self.settings.affected_tire].position} ({self.settings.affected_tire}) at {self.settings.leak_rate} PSI/min",
                tire=self.settings.affected_tire
            )

    def add_alert(self, severity: AlertSeverity, message: str, tire: str | None = None):
        now = datetime.now()
        alert = Alert(
            id=str(uuid.uuid4())[:8],
            severity=severity,
            message=message,
            tire=tire,
            timestamp=self.elapsed_simulated_seconds,
            formatted_time=now.strftime("%H:%M:%S")
        )
        self.alerts.insert(0, alert)
        if len(self.alerts) > self._max_alerts:
            self.alerts.pop()

    def start(self):
        """Start or resume the simulation."""
        if self.run_state != "RUNNING":
            self.run_state = "RUNNING"
            self._last_tick_time = time.monotonic()
            self.add_alert("INFO", "TPMS simulation resumed")

    def pause(self):
        """Pause the simulation clock."""
        if self.run_state == "RUNNING":
            self.run_state = "PAUSED"
            self.add_alert("INFO", "TPMS simulation paused")

    def reset(self):
        """Reset all tires, clocks, and telemetry back to nominal state."""
        self.elapsed_real_seconds = 0.0
        self.elapsed_simulated_seconds = 0.0
        for tire in self.tires.values():
            tire.reset(nominal_pressure=self.settings.nominal_pressure, ambient_temp=self.settings.ambient_temp_c)
            
        # Re-apply current configured leak
        affected = self.settings.affected_tire
        if affected in self.tires:
            self.tires[affected].set_leak(self.settings.leak_enabled, self.settings.leak_rate)
            
        self.add_alert("INFO", "TPMS simulation state reset to factory nominal parameters")

    def set_scenario(self, scenario_name: str, custom_rate: float | None = None):
        """Configure simulation preset scenarios."""
        # Reset all leaks first
        for tire in self.tires.values():
            tire.set_leak(False, 0.0)
            
        if scenario_name == "normal":
            self.active_scenario = "Normal Driving"
            self.settings.leak_enabled = False
            self.add_alert("INFO", "Activated scenario: Normal Driving (All tires nominal)")
            
        elif scenario_name == "slow_leak_rr":
            rate = custom_rate or 0.05
            self.active_scenario = "Slow Leak — Rear Right"
            self.settings.affected_tire = "RR"
            self.settings.leak_enabled = True
            self.settings.leak_rate = rate
            self.tires["RR"].set_leak(True, rate)
            self.add_alert("WARNING", f"Activated scenario: Slow Leak on Rear Right ({rate} PSI/min)", "RR")
            
        elif scenario_name == "slow_leak_fl":
            rate = custom_rate or 0.05
            self.active_scenario = "Slow Leak — Front Left"
            self.settings.affected_tire = "FL"
            self.settings.leak_enabled = True
            self.settings.leak_rate = rate
            self.tires["FL"].set_leak(True, rate)
            self.add_alert("WARNING", f"Activated scenario: Slow Leak on Front Left ({rate} PSI/min)", "FL")
            
        elif scenario_name == "rapid_leak_rr":
            rate = custom_rate or 0.35
            self.active_scenario = "Rapid Leak — Rear Right"
            self.settings.affected_tire = "RR"
            self.settings.leak_enabled = True
            self.settings.leak_rate = rate
            self.tires["RR"].set_leak(True, rate)
            self.add_alert("CRITICAL", f"Activated scenario: Rapid Pneumatic Leak on Rear Right ({rate} PSI/min)", "RR")
            
        elif scenario_name == "demo":
            # Optimized for classroom viva demonstration:
            # noticeable drop within 20-30 seconds with 5x or 10x multiplier!
            self.reset()
            self.run_state = "RUNNING"
            self.settings.time_multiplier = 10.0
            self.settings.affected_tire = "RR"
            self.settings.leak_enabled = True
            self.settings.leak_rate = 0.08
            self.tires["RR"].set_leak(True, 0.08)
            self.active_scenario = "Demo Mode: Fast Presentation Run"
            self.add_alert("WARNING", "Demo Mode Engaged: 10x speed multiplier with RR slow leak", "RR")

    def update_settings(self, new_settings: dict):
        """Update configurable simulation parameters."""
        for key, val in new_settings.items():
            if hasattr(self.settings, key):
                setattr(self.settings, key, val)
                
        # Update noise generator if std changed
        if "noise_std" in new_settings:
            self.noise_generator.update_std(self.settings.noise_std)
            
        # Update nominal pressure across tires if modified
        if "nominal_pressure" in new_settings:
            for tire in self.tires.values():
                tire.nominal_pressure = self.settings.nominal_pressure
                
        # Update leak configuration
        if "affected_tire" in new_settings or "leak_enabled" in new_settings or "leak_rate" in new_settings:
            is_enabled = self.settings.leak_enabled
            rate = self.settings.leak_rate if is_enabled else 0.0
            for tid, tire in self.tires.items():
                if tid == self.settings.affected_tire and is_enabled:
                    tire.set_leak(True, rate)
                else:
                    tire.set_leak(False, 0.0)

            if not is_enabled:
                self.active_scenario = "Normal Driving (Leaks Disabled)"
                target_pos = self.tires[self.settings.affected_tire].position
                self.add_alert("INFO", f"Leak simulation disabled on {target_pos} ({self.settings.affected_tire})", self.settings.affected_tire)
            elif "leak_enabled" in new_settings or "affected_tire" in new_settings:
                target_pos = self.tires[self.settings.affected_tire].position
                self.active_scenario = f"Leak Active — {target_pos}"
                self.add_alert("WARNING", f"Leak active on {target_pos} ({self.settings.affected_tire}) at {rate:.2f} PSI/min", self.settings.affected_tire)

        # Update individual sensor online/offline status
        if "sensor_status" in new_settings and isinstance(new_settings["sensor_status"], dict):
            for tid, st in new_settings["sensor_status"].items():
                if tid in self.tires:
                    self.tires[tid].set_sensor_status(st)

        if "sensor_toggle" in new_settings:
            target_id = new_settings["sensor_toggle"]
            if target_id in self.tires:
                curr = self.tires[target_id].sensor_status
                new_st = "OFFLINE" if curr == "ONLINE" else "ONLINE"
                self.tires[target_id].set_sensor_status(new_st)

        # Update individual tire temperatures
        if "tire_temperatures" in new_settings and isinstance(new_settings["tire_temperatures"], dict):
            for tid, temp in new_settings["tire_temperatures"].items():
                if tid in self.tires:
                    self.tires[tid].set_temperature(temp)

        if new_settings.get("reset_temperatures"):
            for tire in self.tires.values():
                tire.set_temperature(None)

        if new_settings.get("reset_sensors"):
            for tire in self.tires.values():
                tire.set_sensor_status("ONLINE")

    def calculate_health_scores(self, tire_states: dict[str, TireState]) -> tuple[float, float, float]:
        """
        Calculate separated diagnostic health scores (Requirements 8, 11, 12):
        1. TPMS System Health: based on sensor availability (0-100%).
        2. Tire Health: based on physical tire condition (0-100%).
        3. Overall TPMS Health: weighted composite (0.70*TireHealth + 0.30*SystemHealth).
        """
        online_count = sum(1 for t in self.tires.values() if t.sensor_status == "ONLINE")
        tpms_system_health = round((online_count / 4.0) * 100.0, 1)

        if tire_states:
            tire_health_score = round(sum(s.tire_health for s in tire_states.values()) / len(tire_states), 1)
        else:
            tire_health_score = 100.0

        overall_tpms_health = round(0.70 * tire_health_score + 0.30 * tpms_system_health, 1)
        return tpms_system_health, tire_health_score, overall_tpms_health

    def get_overall_status(self) -> str:
        """
        Evaluate overall vehicle TPMS health status with critical overrides (Requirement 12):
        Any sensor OFFLINE or tire WARNING triggers ATTENTION REQUIRED.
        Multiple sensors OFFLINE or any tire CRITICAL triggers CRITICAL.
        """
        statuses = [t.status for t in self.tires.values()]
        offline_count = sum(1 for t in self.tires.values() if t.sensor_status == "OFFLINE")

        if "CRITICAL" in statuses or offline_count >= 2:
            return "CRITICAL"
        elif "WARNING" in statuses or offline_count >= 1 or "SENSOR FAULT" in statuses:
            return "ATTENTION REQUIRED"
        return "NORMAL"

    def tick(self, real_dt_seconds: float) -> SimulationSnapshot:
        """Execute one simulation tick step."""
        if self.run_state == "RUNNING":
            self.elapsed_real_seconds += real_dt_seconds
            dt_simulated = real_dt_seconds * self.settings.time_multiplier
            self.elapsed_simulated_seconds += dt_simulated
        else:
            dt_simulated = 0.0

        # Step each virtual tire
        tire_states: dict[str, TireState] = {}
        for tid, tire in self.tires.items():
            state, alert_msg = tire.step(
                dt_simulated_seconds=dt_simulated,
                noise_gen=self.noise_generator,
                settings=self.settings,
                ambient_temp=self.settings.ambient_temp_c,
                vehicle_speed_kmh=self.settings.vehicle_speed_kmh,
                drive_mode=self.settings.drive_mode
            )
            tire_states[tid] = state
            if alert_msg:
                sev = "CRITICAL" if ("critical" in alert_msg.lower() or "offline" in alert_msg.lower() or "failure" in alert_msg.lower()) else ("WARNING" if "warning" in alert_msg.lower() or "stale" in alert_msg.lower() else "INFO")
                self.add_alert(sev, alert_msg, tid)

        # Build separated health metrics (Requirement 8, 11, 12)
        system_health, tire_health, overall_health = self.calculate_health_scores(tire_states)
        overall_status = self.get_overall_status()
        online_count = sum(1 for t in self.tires.values() if t.sensor_status == "ONLINE")

        status = SimulationStatus(
            state=self.run_state,
            elapsed_seconds=round(self.elapsed_simulated_seconds, 1),
            simulated_minutes=round(self.elapsed_simulated_seconds / 60.0, 2),
            active_scenario=self.active_scenario,
            overall_status=overall_status,
            sensors_online=f"{online_count} / 4",
            sensors_online_count=online_count,
            tpms_system_health=system_health,
            tire_health_score=tire_health,
            overall_tpms_health=overall_health,
            health_score=overall_health,
            digital_twin=DigitalTwinStatus(
                virtual_vehicle="CONNECTED",
                sensor_streams=f"{online_count} ACTIVE",
                simulation_engine=self.run_state,
                data_synchronization="LIVE" if online_count > 0 else "DEGRADED",
                latency_ms=round(2.5 + float(self.noise_generator.sample(0.8)), 1)
            )
        )

        telemetry = VehicleTelemetry(
            speed_kmh=self.settings.vehicle_speed_kmh,
            ambient_temp_c=self.settings.ambient_temp_c,
            drive_mode=self.settings.drive_mode
        )

        return SimulationSnapshot(
            tires=tire_states,
            status=status,
            alerts=self.alerts[:25],
            settings=self.settings,
            telemetry=telemetry,
            timestamp=round(time.time(), 3)
        )

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue(maxsize=10)
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        self._subscribers.discard(q)

    async def broadcast(self, snapshot: SimulationSnapshot):
        payload = snapshot.model_dump_json()
        dead_queues = []
        for q in self._subscribers:
            try:
                # If queue is full, discard oldest
                if q.full():
                    try:
                        q.get_nowait()
                    except asyncio.QueueEmpty:
                        pass
                q.put_nowait(payload)
            except Exception:
                dead_queues.append(q)
        for dq in dead_queues:
            self._subscribers.discard(dq)

    async def run_loop(self):
        """Asynchronous background loop that steps and broadcasts."""
        while True:
            try:
                now = time.monotonic()
                real_dt = now - self._last_tick_time
                self._last_tick_time = now
                
                # Prevent huge jump if process was suspended
                real_dt = min(real_dt, 1.0)
                
                snapshot = self.tick(real_dt)
                await self.broadcast(snapshot)
                
                # Sleep for configured update interval
                await asyncio.sleep(self.settings.update_interval_sec)
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Error in simulation loop: {e}")
                await asyncio.sleep(0.5)


# Global engine singleton instance
engine = SimulationEngine()
