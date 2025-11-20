from datetime import date, datetime

def to_datetime(d: date | None):
    if d is None:
        return None
    return datetime(d.year, d.month, d.day)
