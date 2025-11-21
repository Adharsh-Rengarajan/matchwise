import pytest
from unittest.mock import AsyncMock
from app.services.application_service import ApplicationService
from app.services.job_service import JobService
from app.services.matching_strategy import LLMMatchingStrategy

@pytest.mark.asyncio
async def test_create_application_success(client, monkeypatch):
    # Mock JobService (job has 2 questions)
    monkeypatch.setattr(
        JobService,
        "get_job_by_id",
        AsyncMock(return_value={
            "id": "job123",
            "questions": [
                {"questionNo": 1, "question": "Q1"},
                {"questionNo": 2, "question": "Q2"}
            ]
        })
    )

    # Mock LLM strategy so no AI calls happen
    monkeypatch.setattr(
        LLMMatchingStrategy,
        "generate_match",
        AsyncMock(return_value={
            "score": 90,
            "matched_skills": ["Python"],
            "missing_skills": [],
            "transferable_skills": [],
            "explanation": "Mocked",
            "provider": "mock",
            "model": "mock"
        })
    )

    # Mock ApplicationService.create_application
    monkeypatch.setattr(
        ApplicationService,
        "create_application",
        AsyncMock(return_value={
            "id": "app123",
            "job_id": "job123",
            "jobseeker_id": "user123"
        })
    )

    resume_bytes = b"fake resume"
    files = {"resume": ("resume.pdf", resume_bytes, "application/pdf")}

    data = {
        "job_id": "job123",
        "jobseeker_id": "user123",
        "answers": '[{"questionNo": 1, "answer": "A1"}, {"questionNo": 2, "answer": "A2"}]',
        "application_status": "APPLIED"
    }

    response = await client.post("/applications/", data=data, files=files)

    assert response.status_code == 201
    assert response.json()["message"] == "Application created successfully"
    assert response.json()["data"]["id"] == "app123"


@pytest.mark.asyncio
async def test_create_application_answer_mismatch(client, monkeypatch):
    monkeypatch.setattr(
        JobService,
        "get_job_by_id",
        AsyncMock(return_value={
            "id": "job123",
            "questions": [
                {"questionNo": 1, "question": "Q1"},
                {"questionNo": 2, "question": "Q2"}
            ]
        })
    )

    resume_bytes = b"dummy"
    files = {"resume": ("resume.pdf", resume_bytes, "application/pdf")}

    data = {
        "job_id": "job123",
        "jobseeker_id": "user123",
        "answers": '[{"questionNo": 1, "answer": "A1"}]', 
        "application_status": "APPLIED"
    }

    response = await client.post("/applications/", data=data, files=files)

    assert response.status_code == 400   
    assert "Incorrect number of answers" in response.json()["detail"]