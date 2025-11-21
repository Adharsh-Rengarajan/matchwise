class ProviderSelector:
    """
    Provides sequential failover across multiple keys/providers.
    """

    @staticmethod
    def next_key(keys: list, index_ref: dict):
        idx = index_ref["i"]
        key = keys[idx]
        index_ref["i"] = (idx + 1) % len(keys)
        return key
