class ScoreNormalizer:
    """
    Normalizes various scoring sources to a 0–100 score.
    """

    @staticmethod
    def normalize(value: float, min_v=0, max_v=1):
        if max_v == min_v:
            return 0
        scaled = (value - min_v) / (max_v - min_v)
        return round(scaled * 100, 2)
