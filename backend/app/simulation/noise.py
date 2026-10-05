import numpy as np


class SensorNoiseGenerator:
    """
    Generates realistic sensor noise using Gaussian (normal) distribution.
    Simulates physical capacitive / piezoresistive TPMS pressure sensor fluctuations.
    """
    def __init__(self, std_dev: float = 0.09, seed: int | None = None):
        self._rng = np.random.default_rng(seed)
        self.std_dev = std_dev

    def sample(self, std_dev: float | None = None) -> float:
        """Generate a single noise sample with mean=0.0."""
        sigma = std_dev if std_dev is not None else self.std_dev
        if sigma <= 0.0:
            return 0.0
        # Draw from Gaussian distribution
        return float(self._rng.normal(loc=0.0, scale=sigma))

    def update_std(self, new_std: float):
        self.std_dev = max(0.0, new_std)
