def test_login_recruiter(client):
    payload = {
        "email": "recruiter@test.com",
        "password": "test123"
    }

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 200
    response_json = response.json()

    assert response_json["message"] == "Login successful"
    assert response_json["data"]["email"] == payload["email"]
    assert response_json["data"]["role"] == "recruiter"


def test_login_jobseeker(client):
    payload = {
        "email": "jobseeker@test.com",
        "password": "test123"
    }

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 200
    response_json = response.json()

    assert response_json["message"] == "Login successful"
    assert response_json["data"]["email"] == payload["email"]
    assert response_json["data"]["role"] == "jobseeker"
