from datetime import datetime, date

def convert_date(d):
    if isinstance(d, date):
        return datetime(d.year, d.month, d.day)
    return d

class Job:
    def __init__(self, recruiter_id, title, description, salary, location,
                 type, start_date, end_date, skills_required, status):
        
        self.recruiter_id = recruiter_id
        self.title = title
        self.description = description
        self.salary = salary
        self.location = location
        self.type = type
        self.start_date = convert_date(start_date)
        self.end_date = convert_date(end_date)
        self.skills_required = skills_required
        self.status = status
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            "recruiter_id": self.recruiter_id,
            "title": self.title,
            "description": self.description,
            "salary": self.salary,
            "location": self.location,
            "type": self.type,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "skills_required": self.skills_required,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
