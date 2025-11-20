import pytest
from unittest.mock import AsyncMock
from app.services.job_service import JobService
from app.services.user_service import UserService

@pytest.mark.asyncio
async def test_create_job_success(client, monkeypatch):
    # Mock recruiter check
    monkeypatch.setattr(
        UserService,
        "get_user_by_id",
        AsyncMock(return_value={"userId": "1", "role": "recruiter"})
    )

    monkeypatch.setattr(
        JobService,
        "create_job",
        AsyncMock(return_value={
            "id": "job123",
            "title": "Backend Developer"
        })
    )

    payload = {
        "recruiter_id": "1",
        "title": "Backend Developer",
        "description": "Build APIs",
        "salary": "10 LPA",
        "location": "Remote",
        "type": "Full-Time",
        "start_date": "2024-01-01",
        "skills_required": ["Python", "FastAPI"],
        "status": "OPEN"
    }

    response = await client.post("/jobs/", json=payload)

    assert response.status_code == 201
    assert response.json()["message"] == "Job created successfully"
    assert response.json()["data"]["id"] == "job123"


@pytest.mark.asyncio
async def test_create_job_unauthorized(client, monkeypatch):
    monkeypatch.setattr(
        UserService,
        "get_user_by_id",
        AsyncMock(return_value={"userId": "1", "role": "jobseeker"})
    )

    payload = {
        "recruiter_id": "1",
        "title": "Backend Developer",
        "description": "Build APIs",
        "salary": "10 LPA",
        "location": "Remote",
        "type": "Full-Time",
        "start_date": "2024-01-01",
        "skills_required": ["Python"],
        "status": "OPEN"
    }

    response = await client.post("/jobs/", json=payload)

    assert response.status_code == 403   # FastAPI HTTPException
    assert response.json()["detail"] == "Only recruiters can create jobs"


@pytest.mark.asyncio
async def test_get_jobs(client, monkeypatch):
    mock_jobs = [
        {"id": "1", "title": "Job 1"},
        {"id": "2", "title": "Job 2"}
    ]

    monkeypatch.setattr(
        JobService,
        "get_jobs_by_recruiter",
        AsyncMock(return_value=mock_jobs)
    )

    response = await client.get("/jobs/123")

    assert response.status_code == 200
    assert response.json()["message"] == "Jobs fetched"
    assert len(response.json()["data"]) == 2


@pytest.mark.asyncio
async def test_get_job_success(client, monkeypatch):
    monkeypatch.setattr(
        JobService,
        "get_job",
        AsyncMock(return_value={"id": "job123", "title": "Backend Developer"})
    )

    response = await client.get("/jobs/job/job123")

    assert response.status_code == 200
    assert response.json()["message"] == "Job fetched"
    assert response.json()["data"]["id"] == "job123"


@pytest.mark.asyncio
async def test_get_job_not_found(client, monkeypatch):
    monkeypatch.setattr(
        JobService,
        "get_job",
        AsyncMock(return_value=None)
    )

    response = await client.get("/jobs/job/doesnotexist")

    assert response.status_code == 404
    assert response.json()["detail"] == "Job not found"
