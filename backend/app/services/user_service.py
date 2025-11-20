from app.database import get_database
from app.utils.hashing import hash_password, verify_password
from app.models.user_factory import UserFactory


class UserService:

    @staticmethod
    async def register(user_data):
        db = await get_database()

        existing = await db.users.find_one({"email": user_data.email})
        if existing:
            raise ValueError("Email already exists")

        user_obj = UserFactory.create_user(role=user_data.role, data=user_data.dict())
        user_dict = user_obj.to_dict()
        user_dict["password"] = hash_password(user_dict["password"])

        result = await db.users.insert_one(user_dict)

        # Build clean response object
        return {
            "userId": str(result.inserted_id),
            "email": user_dict["email"],
            "name": user_dict["name"],
            "phone": user_dict["phone"],
            "role": user_dict["role"]
        }



    @staticmethod
    async def login(email: str, password: str):
        db = await get_database()

        user = await db.users.find_one({"email": email})
        if not user or not verify_password(password, user["password"]):
            return None

        return {
            "userId": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "phone": user["phone"],
            "role": user["role"]
        }

