from app.models.recruiter_model import Recruiter
from app.models.jobseeker_model import JobSeeker

class UserFactory:

    @staticmethod
    def create_user(role: str, data: dict):
        if role == "recruiter":
            return Recruiter(
                email=data["email"],
                password=data["password"],
                name=data["name"],
                phone=data["phone"],
                company=data.get("company"),
                designation=data.get("designation")
            )

        elif role == "jobseeker":
            return JobSeeker(
                email=data["email"],
                password=data["password"],
                name=data["name"],
                phone=data["phone"],
                skills=data.get("skills", []),
                experience=data.get("experience", []),  # <-- FIX
                education=data.get("education", [])    # <-- FIX
            )

        else:
            raise ValueError("Invalid role")
