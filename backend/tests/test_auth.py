def test_root_endpoint(client):
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Welcome to AI Support Hub API"
    assert data["version"] == "0.1.0"
    assert data["status"] == "running"


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy"
    }


def test_login_requires_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        json={},
    )

    assert response.status_code == 422


def test_protected_me_endpoint_requires_authentication(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_register_user(client):
    payload = {
        "email": "pytest.auth@example.com",
        "password": "TestPassword123!",
        "full_name": "Pytest Auth User",
        "organization_name": "Pytest Auth Organization",
    }

    response = client.post(
        "/api/v1/auth/register",
        json=payload,
    )

    assert response.status_code == 201

    data = response.json()

    assert "user" in data
    assert data["user"]["email"] == payload["email"]
    assert data["user"]["full_name"] == payload["full_name"]
    assert data["user"]["is_active"] is True

    assert data["organization_name"] == payload["organization_name"]
    assert data["role"] == "owner"
    assert isinstance(data["organization_id"], int)


def test_login_user(client):
    payload = {
        "email": "pytest.auth@example.com",
        "password": "TestPassword123!",
    }

    response = client.post(
        "/api/v1/auth/login",
        json=payload,
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 0


def test_authenticated_user_can_access_me(client):
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "pytest.auth@example.com",
            "password": "TestPassword123!",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == "pytest.auth@example.com"
    assert data["full_name"] == "Pytest Auth User"
    assert data["is_active"] is True


def test_login_with_wrong_password_fails(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "pytest.auth@example.com",
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401

    data = response.json()

    assert data["detail"] == "Invalid email or password."


def test_login_with_unknown_email_fails(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "doesnotexist@example.com",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 401

    data = response.json()

    assert data["detail"] == "Invalid email or password."


def test_duplicate_registration_fails(client):
    payload = {
        "email": "pytest.auth@example.com",
        "password": "TestPassword123!",
        "full_name": "Another User",
        "organization_name": "Another Organization",
    }

    response = client.post(
        "/api/v1/auth/register",
        json=payload,
    )

    assert response.status_code == 409