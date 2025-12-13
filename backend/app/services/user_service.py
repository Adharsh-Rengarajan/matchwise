from bson import ObjectId
from datetime import datetime, date
from app.utils.mongo import sanitize_document
from app.models.user_factory import UserFactory
from app.repository.user_repository import UserRepository
from app.database import get_database
from app.utils.jwt_utils import create_access_token
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
        existing = await UserRepository.find_by_email(payload.email)
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

        inserted_id = await UserRepository.insert_one(user_dict)
        user_dict["_id"] = inserted_id

        token = create_access_token({
            "user_id": str(inserted_id),
            "email": payload.email,
            "role": payload.role
        })

        user_response = sanitize_document(user_dict)
        user_response["token"] = token
        if "password" in user_response:
            del user_response["password"]

        return user_response

    @staticmethod
    async def login(email: str, password: str):
        user = await UserRepository.find_by_email(email)
        if not user:
            return None

        if not bcrypt.checkpw(password.encode(), user["password"].encode()):
            return None

        token = create_access_token({
            "user_id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"]
        })

        user_response = sanitize_document(user)
        user_response["token"] = token
        if "password" in user_response:
            del user_response["password"]

        return user_response

    @staticmethod
    async def get_user_by_id(user_id: str):
        user = await UserRepository.find_by_id(user_id)
        if user:
            sanitized = sanitize_document(user)
            if "password" in sanitized:
                del sanitized["password"]
            return sanitized
        return None

    @staticmethod
    async def update_jobseeker_profile(user_id: str, update_data: dict):
        if "password" in update_data:
            del update_data["password"]

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

        result = await UserRepository.update_by_id(user_id, clean_data)
        if result:
            sanitized = sanitize_document(result)
            if "password" in sanitized:
                del sanitized["password"]
            return sanitized
        return None

    @staticmethod
    async def search_jobseekers(filters: dict):
        query = {"role": "jobseeker"}

        if filters.get("skills"):
            query["skills"] = {"$in": filters["skills"]}

        if filters.get("location"):
            query["location"] = {"$regex": filters["location"], "$options": "i"}

        page = filters.get("page", 1)
        limit = filters.get("limit", 10)
        skip = (page - 1) * limit

        jobseekers = await UserRepository.find_jobseekers(query, skip, limit)
        total = await UserRepository.count_jobseekers(query)

        return {
            "data": [sanitize_document(js) for js in jobseekers],
            "total": total,
            "page": page,
            "limit": limit
        }