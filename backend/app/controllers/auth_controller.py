from fastapi import APIRouter
from app.schemas.auth_schema import LoginRequest
from app.services.user_service import UserService
from app.utils.response import api_response
from app.utils.jwt_utils import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
async def login(credentials: LoginRequest):
    result = await UserService.login(credentials.email, credentials.password)

    if not result:
        return api_response(401, "Invalid email or password", None)

    token = create_access_token(data={
        "user_id": result["id"],
        "email": result["email"],
        "role": result["role"]
    })
    
    result["token"] = token
    
    return api_response(200, "Login successful", result)