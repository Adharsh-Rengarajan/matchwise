from bson import ObjectId
from datetime import datetime, date
from app.database import get_database
from app.utils.mongo import sanitize_document
from app.models.user_factory import UserFactory
import bcrypt


def convert_dates(obj):
    if isinstance(obj, dict):
        return {k: convert_dates(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_dates(item) for item in obj]
    elif isinstance(obj, date) and not isinstance(obj, datetime):
        return datetime(obj.year, obj.month, obj.day)
    return obj


class UserService:

    @staticmethod
    async def register(payload):
        db = await get_database()

        existing = await db.users.find_one({"email": payload.email})
        if existing:
            raise ValueError("Email already registered")

        hashed_password = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()

        user_data = payload.dict()
        user_data["password"] = hashed_password

        if hasattr(payload, "experience"):
            user_data["experience"] = [convert_dates(exp) for exp in user_data.get("experience", [])]
        if hasattr(payload, "education"):
            user_data["education"] = [convert_dates(edu) for edu in user_data.get("education", [])]

        user = UserFactory.create_user(payload.role, user_data)
        user_dict = user.to_dict()
        user_dict = convert_dates(user_dict)

        result = await db.users.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id

        return sanitize_document(user_dict)

    @staticmethod
    async def login(email: str, password: str):
        db = await get_database()

        user = await db.users.find_one({"email": email})
        if not user:
            return None

        if not bcrypt.checkpw(password.encode(), user["password"].encode()):
            return None

        return sanitize_document(user)

    @staticmethod
    async def get_user_by_id(user_id: str):
        db = await get_database()

        if not ObjectId.is_valid(user_id):
            return None

        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            return sanitize_document(user)
        return None

    @staticmethod
    async def update_jobseeker_profile(user_id: str, update_data: dict):
        db = await get_database()

        if "experience" in update_data and update_data["experience"] is not None:
            update_data["experience"] = [convert_dates(exp) if isinstance(exp, dict) else exp.dict() if hasattr(exp, 'dict') else exp for exp in update_data["experience"]]
            update_data["experience"] = convert_dates(update_data["experience"])

        if "education" in update_data and update_data["education"] is not None:
            update_data["education"] = [convert_dates(edu) if isinstance(edu, dict) else edu.dict() if hasattr(edu, 'dict') else edu for edu in update_data["education"]]
            update_data["education"] = convert_dates(update_data["education"])

        clean_data = {k: v for k, v in update_data.items() if v is not None}

        if not clean_data:
            return await UserService.get_user_by_id(user_id)

        clean_data["updated_at"] = datetime.utcnow()

        result = await db.users.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": clean_data},
            return_document=True
        )

        if result:
            return sanitize_document(result)
        return None