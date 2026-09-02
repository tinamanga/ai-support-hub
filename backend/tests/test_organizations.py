def test_organization_access_requires_authentication(client):
    response = client.get("/api/v1/organizations/1/access")

    assert response.status_code == 401


def test_organization_access_granted_for_member(client):
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
        "/api/v1/organizations/1/access",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["organization_id"] == 1
    assert data["role"] == "owner"
    assert data["access"] == "granted"


def test_organization_access_denied_for_other_organization(client):
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
        "/api/v1/organizations/2/access",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403

    assert response.json()["detail"] == (
        "You do not have access to this organization."
    )


def test_admin_area_requires_authentication(client):
    response = client.get("/api/v1/organizations/1/admin-area")

    assert response.status_code == 401


def test_owner_can_access_admin_area(client):
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
        "/api/v1/organizations/1/admin-area",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["organization_id"] == 1
    assert data["role"] == "owner"
    assert data["message"] == "You have administrative access."


def test_owner_cannot_access_other_organization_admin_area(client):
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
        "/api/v1/organizations/2/admin-area",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403

    assert response.json()["detail"] == (
        "You do not have access to this organization."
    )
