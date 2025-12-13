import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.middleware.auth_middleware import require_auth
from fastapi import Request

def mock_auth(allowed_roles=None):
    async def mock_dependency(request: Request):
        return {
            "user_id": "test_user_123",
            "email": "test@example.com",
            "role": "recruiter" if allowed_roles and "recruiter" in allowed_roles else "jobseeker"
        }
    return mock_dependency

@pytest_asyncio.fixture
async def client():
    app.dependency_overrides[require_auth] = mock_auth
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()