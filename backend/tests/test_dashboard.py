from fastapi.testclient import TestClient


def register_and_login(
    client: TestClient,
    email: str,
    password: str,
    full_name: str,
    organization_name: str,
) -> tuple[str, int]:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "organization_name": organization_name,
        },
    )

    assert register_response.status_code == 201

    organization_id = register_response.json()["organization_id"]

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    return token, organization_id


def test_dashboard_overview_for_organization(client: TestClient):
    token, organization_id = register_and_login(
        client=client,
        email="dashboard-test@example.com",
        password="Dashboard123!",
        full_name="Dashboard Test User",
        organization_name="Dashboard Test Organization",
    )

    response = client.get(
        f"/api/v1/organizations/{organization_id}/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["organization"]["id"] == organization_id
    assert data["organization"]["name"] == "Dashboard Test Organization"
    assert data["organization"]["is_active"] is True

    assert data["total_customers"] == 0

    assert data["conversations"]["total"] == 0
    assert data["conversations"]["open"] == 0
    assert data["conversations"]["pending"] == 0
    assert data["conversations"]["resolved"] == 0
    assert data["conversations"]["closed"] == 0
    assert data["conversations"]["urgent"] == 0
    assert data["conversations"]["high_priority"] == 0
    assert data["conversations"]["assigned"] == 0
    assert data["conversations"]["unassigned"] == 0

    assert data["recent_conversations"] == []


def test_dashboard_rejects_cross_organization_access(client: TestClient):
    token, _organization_id = register_and_login(
        client=client,
        email="dashboard-isolation@example.com",
        password="Dashboard123!",
        full_name="Dashboard Isolation User",
        organization_name="Dashboard Isolation Organization",
    )

    response = client.get(
        "/api/v1/organizations/1/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
        "You do not have access to this organization."
    )
