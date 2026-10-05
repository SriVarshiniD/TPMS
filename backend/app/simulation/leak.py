class LeakModel:
    """
    Simulates a pneumatic slow leak fault injection in a tire.
    Models pressure loss over elapsed simulated time.
    """
    def __init__(self, leak_rate_psi_per_min: float = 0.05):
        # leak rate in PSI per minute
        self.leak_rate_psi_per_min = leak_rate_psi_per_min

    def compute_loss(self, elapsed_simulated_seconds: float) -> float:
        """
        Calculate cumulative pressure loss in PSI over elapsed simulated seconds.
        rate (PSI/min) * (seconds / 60)
        """
        if self.leak_rate_psi_per_min <= 0 or elapsed_simulated_seconds <= 0:
            return 0.0
        minutes = elapsed_simulated_seconds / 60.0
        return self.leak_rate_psi_per_min * minutes
