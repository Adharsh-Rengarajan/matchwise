import pytest
from unittest.mock import AsyncMock, Mock
from app.services.application_service import ApplicationService
from app.services.job_service import JobService
from app.services.user_service import UserService
from app.services.matching_strategy import LLMMatchingStrategy
from app.services.message_service import MessageService
from bson import ObjectId
from datetime import datetime


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["message"] == "healthy"


@pytest.mark.asyncio
async def test_root_endpoint(client):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "MatchWise API is running"


@pytest.mark.asyncio
async def test_login_success(client, monkeypatch):
    monkeypatch.setattr(
        UserService,
        "login",
        AsyncMock(return_value={
            "id": "user123",
            "email": "test@example.com",
            "name": "Test User",
            "role": "jobseeker"
        })
    )

    response = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "Login successful"
    assert json_data["data"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client, monkeypatch):
    monkeypatch.setattr(
        UserService,
        "login",
        AsyncMock(return_value=None)
    )

    response = await client.post("/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpassword"
    })

    assert response.status_code == 401
    assert response.json()["message"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_create_job_success(client, monkeypatch):
    monkeypatch.setattr(
        UserService,
        "get_user_by_id",
        AsyncMock(return_value={"_id": "recruiter123", "role": "recruiter"})
    )

    monkeypatch.setattr(
        JobService,
        "create_job",
        AsyncMock(return_value={
            "id": "job123",
            "title": "Software Engineer",
            "description": "Build amazing things",
            "salary": "100000-150000",
            "location": "Remote",
            "type": "Full-Time",
            "status": "OPEN"
        })
    )

    payload = {
        "recruiter_id": "recruiter123",
        "title": "Software Engineer",
        "description": "Build amazing things",
        "salary": "100000-150000",
        "location": "Remote",
        "type": "Full-Time",
        "start_date": "2024-01-01",
        "skills_required": ["Python", "FastAPI", "MongoDB"],
        "status": "OPEN",
        "questions": []
    }

    response = await client.post("/jobs/", json=payload)

    assert response.status_code == 201
    json_data = response.json()
    assert json_data["message"] == "Job created successfully"
    assert json_data["data"]["id"] == "job123"


@pytest.mark.asyncio
async def test_create_job_non_recruiter(client, monkeypatch):
    monkeypatch.setattr(
        UserService,
        "get_user_by_id",
        AsyncMock(return_value={"_id": "user123", "role": "jobseeker"})
    )

    payload = {
        "recruiter_id": "user123",
        "title": "Software Engineer",
        "description": "Build amazing things",
        "salary": "100000",
        "location": "Remote",
        "type": "Full-Time",
        "start_date": "2024-01-01",
        "skills_required": ["Python"],
        "status": "OPEN",
        "questions": []
    }

    response = await client.post("/jobs/", json=payload)

    assert response.status_code == 403
    assert response.json()["detail"] == "Only recruiters can create jobs"


@pytest.mark.asyncio
async def test_get_jobs_by_recruiter(client, monkeypatch):
    monkeypatch.setattr(
        JobService,
        "get_jobs_by_recruiter",
        AsyncMock(return_value=[
            {"id": "job1", "title": "Backend Developer"},
            {"id": "job2", "title": "Frontend Developer"}
        ])
    )

    response = await client.get("/jobs/recruiter123")

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "Jobs retrieved successfully"
    assert len(json_data["data"]) == 2


@pytest.mark.asyncio
async def test_get_job_by_id_success(client, monkeypatch):
    monkeypatch.setattr(
        JobService,
        "get_job_by_id",
        AsyncMock(return_value={
            "id": "job123",
            "title": "Software Engineer",
            "description": "Great opportunity"
        })
    )

    response = await client.get("/jobs/job/job123")

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "Job retrieved successfully"
    assert json_data["data"]["id"] == "job123"


@pytest.mark.asyncio
async def test_get_job_by_id_not_found(client, monkeypatch):
    monkeypatch.setattr(
        JobService,
        "get_job_by_id",
        AsyncMock(return_value=None)
    )

    response = await client.get("/jobs/job/nonexistent")

    assert response.status_code == 404
    assert response.json()["detail"] == "Job not found"


@pytest.mark.asyncio
async def test_search_jobs(client, monkeypatch):
    monkeypatch.setattr(
        JobService,
        "search_jobs",
        AsyncMock(return_value=[
            {"id": "job1", "title": "Python Developer"},
            {"id": "job2", "title": "Backend Engineer"}
        ])
    )

    filters = {
        "title": "Python",
        "keyword": None,
        "type": None,
        "skills": None
    }

    response = await client.post("/jobs/search", json=filters)

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "Job search results"
    assert len(json_data["data"]) == 2


@pytest.mark.asyncio
async def test_create_application_success(client, monkeypatch):
    monkeypatch.setattr(
        JobService,
        "get_job_by_id",
        AsyncMock(return_value={
            "id": "job123",
            "questions": [
                {"questionNo": 1, "question": "Why do you want this job?"},
                {"questionNo": 2, "question": "What are your strengths?"}
            ]
        })
    )

    monkeypatch.setattr(
        LLMMatchingStrategy,
        "generate_match",
        AsyncMock(return_value=Mock(
            to_dict=Mock(return_value={
                "score": 85,
                "matched_skills": ["Python", "FastAPI"],
                "missing_skills": [],
                "transferable_skills": [],
                "explanation": "Strong match",
                "provider": "anthropic",
                "model": "claude-3"
            })
        ))
    )

    monkeypatch.setattr(
        ApplicationService,
        "create_application",
        AsyncMock(return_value={
            "id": "app123",
            "job_id": "job123",
            "jobseeker_id": "user123",
            "application_status": "PENDING"
        })
    )

    resume_bytes = b"fake resume content"
    files = {"resume": ("resume.pdf", resume_bytes, "application/pdf")}

    data = {
        "job_id": "job123",
        "jobseeker_id": "user123",
        "answers": '[{"questionNo": 1, "answer": "I am passionate"}, {"questionNo": 2, "answer": "I am skilled"}]',
        "application_status": "PENDING"
    }

    response = await client.post("/applications/", data=data, files=files)

    assert response.status_code == 201
    json_data = response.json()
    assert json_data["message"] == "Application created successfully"
    assert json_data["data"]["id"] == "app123"


@pytest.mark.asyncio
async def test_create_application_wrong_answer_count(client, monkeypatch):
    monkeypatch.setattr(
        JobService,
        "get_job_by_id",
        AsyncMock(return_value={
            "id": "job123",
            "questions": [
                {"questionNo": 1, "question": "Question 1"},
                {"questionNo": 2, "question": "Question 2"}
            ]
        })
    )

    resume_bytes = b"fake resume"
    files = {"resume": ("resume.pdf", resume_bytes, "application/pdf")}

    data = {
        "job_id": "job123",
        "jobseeker_id": "user123",
        "answers": '[{"questionNo": 1, "answer": "Only one answer"}]',
        "application_status": "PENDING"
    }

    response = await client.post("/applications/", data=data, files=files)

    assert response.status_code == 400
    assert "Incorrect number of answers" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_application_by_id(client, monkeypatch):
    app_id = str(ObjectId())
    
    monkeypatch.setattr(
        ApplicationService,
        "get_application_by_id",
        AsyncMock(return_value={
            "id": app_id,
            "job_id": "job123",
            "jobseeker_id": "user123",
            "application_status": "APPLIED"
        })
    )

    response = await client.get(f"/applications/{app_id}/")

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "Application retrieved"


@pytest.mark.asyncio
async def test_get_application_invalid_id(client):
    response = await client.get("/applications/invalid_id/")

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid application ID"


@pytest.mark.asyncio
async def test_update_application_status(client, monkeypatch):
    app_id = str(ObjectId())
    
    monkeypatch.setattr(
        ApplicationService,
        "update_application_status",
        AsyncMock(return_value={
            "id": app_id,
            "application_status": "APPLIED"
        })
    )

    response = await client.patch(
        f"/applications/{app_id}/",
        json={"application_status": "APPLIED"}
    )

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "Application status updated"


@pytest.mark.asyncio
async def test_update_application_invalid_status(client):
    app_id = str(ObjectId())
    
    response = await client.patch(
        f"/applications/{app_id}/",
        json={"application_status": "INVALID_STATUS"}
    )

    assert response.status_code == 400
    assert "Invalid status" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_applications_by_jobseeker(client, monkeypatch):
    monkeypatch.setattr(
        ApplicationService,
        "get_applications_by_jobseeker",
        AsyncMock(return_value=[
            {"id": "app1", "job_id": "job1"},
            {"id": "app2", "job_id": "job2"}
        ])
    )

    response = await client.get("/applications/jobseeker/user123/")

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "Applications retrieved"
    assert len(json_data["data"]) == 2


@pytest.mark.asyncio
async def test_send_message(client, monkeypatch):
    monkeypatch.setattr(
        MessageService,
        "send_message",
        AsyncMock(return_value={
            "id": "msg123",
            "sender_id": "user1",
            "receiver_id": "user2",
            "content": "Hello"
        })
    )

    payload = {
        "sender_id": "user1",
        "receiver_id": "user2",
        "content": "Hello"
    }

    response = await client.post("/messages/", json=payload)

    assert response.status_code == 201
    json_data = response.json()
    assert json_data["message"] == "Message sent"


@pytest.mark.asyncio
async def test_get_conversation(client, monkeypatch):
    monkeypatch.setattr(
        MessageService,
        "get_conversation",
        AsyncMock(return_value=[
            {"id": "msg1", "content": "Hi"},
            {"id": "msg2", "content": "Hello"}
        ])
    )

    response = await client.get("/messages/user1/user2")

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "Conversation retrieved"
    assert len(json_data["data"]) == 2


@pytest.mark.asyncio
async def test_mark_messages_as_read(client, monkeypatch):
    monkeypatch.setattr(
        MessageService,
        "mark_messages_as_read",
        AsyncMock(return_value={"modified_count": 3})
    )

    payload = {
        "sender_id": "user1",
        "receiver_id": "user2"
    }

    response = await client.patch("/messages/mark-read", json=payload)

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "Messages marked as read"


@pytest.mark.asyncio
async def test_mark_messages_missing_params(client):
    response = await client.patch("/messages/mark-read", json={})

    assert response.status_code == 400
    assert "sender_id and receiver_id are required" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_top_candidates(client, monkeypatch):
    monkeypatch.setattr(
        JobService,
        "get_top_candidates",
        AsyncMock(return_value=[
            {"jobseeker_id": "user1", "score": 95},
            {"jobseeker_id": "user2", "score": 88}
        ])
    )

    response = await client.get("/jobs/job123/top-candidates")

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["message"] == "Top candidates retrieved"
    assert len(json_data["data"]) == 2