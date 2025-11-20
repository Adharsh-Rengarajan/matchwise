from app.models.user_model import User

class Recruiter(User):
    def __init__(self, email, password, name, phone, company=None, designation=None):
        super().__init__(email, password, name, phone, role="recruiter")
        self.company = company
        self.designation = designation

    def to_dict(self):
        base = super().to_dict()
        base.update({
            "company": self.company,
            "designation": self.designation
        })
        return base
