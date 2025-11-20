def test_jobseeker_registration(client):
    payload = {
        "email": "jobseeker@test.com",
        "password": "test123",
        "name": "Alice Doe",
        "phone": "8888888888",
        "skills": ["Python", "FastAPI"],
        "experience": [
            {
                "title": "Software Engineer",
                "company": "TechCorp",
                "start_date": "2020-01-01",
                "end_date": "2021-01-01"
            }
        ],
        "education": [
            {
                "degree": "B.Tech",
                "institution": "XYZ University",
                "start_date": "2016-06-01",
                "end_date": "2020-04-01"
            }
        ],
        "role": "jobseeker"
    }

    response = client.post("/jobseekers/register", json=payload)

    assert response.status_code == 200 or response.status_code == 201
    assert response.json()["data"]["email"] == payload["email"]
    assert response.json()["data"]["role"] == "jobseeker"
