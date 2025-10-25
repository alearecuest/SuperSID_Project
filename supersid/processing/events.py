"""
Event detection module for SuperSID Next.

Provides classes and functions to detect sudden ionospheric disturbances (SID)
based on signal features using change detection methods (CUSUM).
"""


def cusum_detect(cur: float, baseline: float, k: float, h: float, state: dict) -> bool:
    """
    Apply a simple one-sided CUSUM test to detect changes.

    Parameters
    ----------
    cur : float
        Current feature value (e.g., RMS).
    baseline : float
        Baseline or expected mean value.
    k : float
        Slack parameter (sensitivity).
    h : float
        Threshold for detection.
    state : dict
        Dictionary to keep track of cumulative sum state.

    Returns
    -------
    bool
        True if an event is detected, False otherwise.
    """
    s = max(0.0, state.get("s", 0.0) + cur - baseline - k)
    state["s"] = s
    return s > h


class EventDetector:
    """Detects candidate SID events from channel features."""

    def __init__(self, sensitivity: float = 0.8):
        """
        Parameters
        ----------
        sensitivity : float
            Controls the detection threshold. Higher values = more sensitive.
        """
        self.base = {}
        self.state = {}
        self.k = 0.01
        self.h = 0.2 * sensitivity

    def detect(self, feats: dict[str, dict[str, float]]) -> list[dict]:
        """
        Detect events from features.

        Parameters
        ----------
        feats : dict[str, dict[str, float]]
            Features per channel.

        Returns
        -------
        list of dict
            Detected events with channel and value.
        """
        events = []
        for name, f in feats.items():
            b = self.base.get(name, f["rms"])
            if cusum_detect(
                f["rms"], b, self.k, self.h, self.state.setdefault(name, {})
            ):
                events.append(
                    {"channel": name, "type": "sid_candidate", "value": f["rms"]}
                )
            # update baseline slowly
            self.base[name] = 0.99 * b + 0.01 * f["rms"]
        return events
