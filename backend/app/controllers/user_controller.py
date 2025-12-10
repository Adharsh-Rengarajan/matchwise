from fastapi import APIRouter, HTTPException
from app.services.user_service import UserService
from app.utils.response import api_response

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}")
async def get_user_by_id(user_id: str):
    try:
        user = await UserService.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return api_response(200, "User retrieved successfully", user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error fetching user: {str(e)}")