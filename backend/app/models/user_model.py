from datetime import datetime

class User:
    def __init__(self, email, password, name, phone, role):
        self.email = email
        self.password = password
        self.name = name
        self.phone = phone
        self.role = role
        self.createdAt = datetime.utcnow()

    def to_dict(self):
        return {
            "email": self.email,
            "password": self.password,
            "name": self.name,
            "phone": self.phone,
            "role": self.role,
            "createdAt": self.createdAt
        }
