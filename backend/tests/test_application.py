import pytest
from unittest.mock import AsyncMock
from app.services.application_service import ApplicationService
from app.services.user_service import UserService


@pytest.mark.asyncio
async def test_create_application_success(client, monkeypatch):
    # Mock jobseeker validation
    monkeypatch.setattr(
        UserService,
        "get_user_by_id",
        AsyncMock(return_value={"_id": "123", "role": "jobseeker"})
    )

    # Mock create_application response
    monkeypatch.setattr(
        ApplicationService,
        "create_application",
        AsyncMock(return_value={"id": "app1", "job_id": "j1"})
    )

    response = await client.post("/applications/", json={
        "job_id": "j1",
        "jobseeker_id": "u1",
        "questions": [{"questionNo": 1, "question": "Why?"}],
        "ai_score": 85,
        "ai_feedback": "Strong answer",
        "keyword_score": 90,
        "application_status": "APPLIED"
    })

    assert response.status_code == 201
    assert response.json()["message"] == "Application created"


@pytest.mark.asyncio
async def test_create_application_invalid_user(client, monkeypatch):
    # Mock a recruiter returned instead of jobseeker
    monkeypatch.setattr(
        UserService,
        "get_user_by_id",
        AsyncMock(return_value={"_id": "1", "role": "recruiter"})
    )

    response = await client.post("/applications/", json={
        "job_id": "j1",
        "jobseeker_id": "u1",
        "questions": [],
        "ai_score": 70,
        "ai_feedback": "OK",
        "keyword_score": 65,
        "application_status": "APPLIED"
    })

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_application_success(client, monkeypatch):
    monkeypatch.setattr(
        ApplicationService,
        "get_application",
        AsyncMock(return_value={"id": "app1", "job_id": "j1"})
    )

    response = await client.get("/applications/application/app1")

    assert response.status_code == 200
    assert response.json()["data"]["id"] == "app1"


@pytest.mark.asyncio
async def test_update_status_success(client, monkeypatch):
    monkeypatch.setattr(
        ApplicationService,
        "update_application_status",
        AsyncMock(return_value={"id": "app1", "application_status": "UNDER_REVIEW"})
    )

    response = await client.patch("/applications/", json={
        "application_id": "app1",
        "application_status": "UNDER_REVIEW"
    })

    assert response.status_code == 200
    assert response.json()["data"]["application_status"] == "UNDER_REVIEW"
