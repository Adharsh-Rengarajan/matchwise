def test_login_invalid(client):
    payload = {
        "email": "doesnotexist@test.com",
        "password": "wrongpass"
    }

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 200 or response.status_code == 401
    assert response.json()["message"] == "Invalid email or password"
