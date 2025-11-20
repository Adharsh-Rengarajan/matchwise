import pytest
from unittest.mock import AsyncMock
from app.services.user_service import UserService


@pytest.mark.asyncio
async def test_login_success(client, monkeypatch):
    # Patch the login service directly
    monkeypatch.setattr(
        UserService,
        "login",
        AsyncMock(return_value={
            "userId": "1",
            "email": "test@example.com",
            "name": "Test User",
            "phone": "123",
            "role": "jobseeker"
        })
    )

    response = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password"
    })

    assert response.status_code == 200
    assert response.json()["message"] == "Login successful"
    assert response.json()["data"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login_failure(client, monkeypatch):
    # Simulate login failure
    monkeypatch.setattr(UserService, "login", AsyncMock(return_value=None))

    response = await client.post("/auth/login", json={
        "email": "wrong@example.com",
        "password": "bad"
    })

    assert response.status_code == 401
    assert response.json()["message"] == "Invalid email or password"
