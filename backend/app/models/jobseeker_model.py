from datetime import datetime, date
from app.models.user_model import User

def to_datetime(d: date):
    if isinstance(d, date):
        return datetime(d.year, d.month, d.day)
    return d

class JobSeeker(User):
    def __init__(self, email, password, name, phone, skills=None, experience=None, education=None):
        super().__init__(email, password, name, phone, role="jobseeker")
        self.skills = skills or []
        self.experience = experience or []
        self.education = education or []

    def to_dict(self):
        base = super().to_dict()

        def convert_nested_dates(items):
            fixed = []
            for item in items:
                new_item = {}
                for key, value in item.items():
                    if isinstance(value, date):
                        new_item[key] = to_datetime(value)
                    else:
                        new_item[key] = value
                fixed.append(new_item)
            return fixed

        base.update({
            "skills": self.skills,
            "experience": convert_nested_dates(self.experience),
            "education": convert_nested_dates(self.education)
        })
        return base
