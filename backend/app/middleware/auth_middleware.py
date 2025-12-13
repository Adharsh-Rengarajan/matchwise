import os
from fastapi import Request, HTTPException
from app.utils.jwt_utils import verify_token

def require_auth(allowed_roles: list = None):
    async def auth_dependency(request: Request):
        # BYPASS AUTH IN TEST MODE
        if os.getenv("TESTING") == "true":
            return {
                "user_id": "test_user_123",
                "email": "test@example.com",
                "role": "recruiter"
            }
        
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        token = auth_header.split(" ")[1]
        payload = verify_token(token)
        
        if payload is None:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        if allowed_roles and payload.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        request.state.user = payload
        return payload
    
    return auth_dependency