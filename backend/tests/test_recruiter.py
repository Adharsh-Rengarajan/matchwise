def test_recruiter_registration(client):
    payload = {
        "email": "recruiter@test.com",
        "password": "test123",
        "name": "John Doe",
        "phone": "9999999999",
        "company": "ABC Corp",
        "designation": "HR",
        "role": "recruiter"
    }

    response = client.post("/recruiters/register", json=payload)

    assert response.status_code == 200 or response.status_code == 201
    assert response.json()["status_code"] in [200, 201]
    assert response.json()["data"]["email"] == payload["email"]
    assert response.json()["data"]["role"] == "recruiter"
