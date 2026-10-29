from uuid import uuid4

import pytest


def register_user(client, label="user"):
    suffix = uuid4().hex[:10]

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": f"{label}-{suffix}@example.com",
            "password": "TestPassword123!",
            "full_name": f"Knowledge Test {label}",
            "organization_name": f"Knowledge Org {suffix}",
        },
    )

    assert response.status_code == 201, response.text
    data = response.json()

    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": f"{label}-{suffix}@example.com",
            "password": "TestPassword123!",
        },
    )

    assert login.status_code == 200, login.text

    return {
        "user_id": data["user"]["id"],
        "organization_id": data["organization_id"],
        "token": login.json()["access_token"],
    }


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_owner_can_create_update_and_delete_knowledge_entry(client):
    owner = register_user(client, "crud")

    base_url = (
        f"/api/v1/organizations/{owner['organization_id']}/knowledge"
    )
    headers = auth_headers(owner["token"])

    created = client.post(
        base_url,
        headers=headers,
        json={
            "title": "Refund policy",
            "content": "Customers can request a refund within 14 days.",
            "category": "Policies",
        },
    )

    assert created.status_code == 201, created.text
    entry = created.json()
    assert entry["title"] == "Refund policy"
    assert entry["category"] == "Policies"
    assert entry["is_published"] is False

    listed = client.get(base_url, headers=headers)
    assert listed.status_code == 200
    assert any(item["id"] == entry["id"] for item in listed.json())

    updated = client.patch(
        f"{base_url}/{entry['id']}",
        headers=headers,
        json={
            "content": "Customers can request a refund within 30 days.",
            "is_published": True,
        },
    )

    assert updated.status_code == 200, updated.text
    assert updated.json()["content"].endswith("30 days.")
    assert updated.json()["is_published"] is True

    deleted = client.delete(
        f"{base_url}/{entry['id']}",
        headers=headers,
    )
    assert deleted.status_code == 204

    missing = client.get(
        f"{base_url}/{entry['id']}",
        headers=headers,
    )
    assert missing.status_code == 404


def test_knowledge_endpoints_require_authentication(client):
    response = client.get("/api/v1/organizations/1/knowledge")
    assert response.status_code == 401

@pytest.mark.parametrize("role", ["agent", "member"])
def test_agent_and_member_see_published_entries_but_not_drafts(
    client, role
):
    owner = register_user(client, "owner")
    agent = register_user(client, "agent")

    organization_id = owner["organization_id"]
    owner_headers = auth_headers(owner["token"])
    agent_headers = auth_headers(agent["token"])

    add_member = client.post(
        f"/api/v1/organizations/{organization_id}/members",
        headers=owner_headers,
        json={
            "user_id": agent["user_id"],
            "role": role,
        },
    )
    assert add_member.status_code == 201, add_member.text

    base_url = f"/api/v1/organizations/{organization_id}/knowledge"

    draft = client.post(
        base_url,
        headers=owner_headers,
        json={
            "title": "Internal notes",
            "content": "This information is not published.",
        },
    )
    assert draft.status_code == 201, draft.text
    draft_id = draft.json()["id"]

    published = client.post(
        base_url,
        headers=owner_headers,
        json={
            "title": "Opening hours",
            "content": "We are open Monday to Friday.",
            "is_published": True,
        },
    )
    assert published.status_code == 201, published.text
    published_id = published.json()["id"]

    agent_list = client.get(base_url, headers=agent_headers)
    assert agent_list.status_code == 200
    assert [item["id"] for item in agent_list.json()] == [published_id]

    hidden_draft = client.get(
        f"{base_url}/{draft_id}",
        headers=agent_headers,
    )
    assert hidden_draft.status_code == 404

    visible_entry = client.get(
        f"{base_url}/{published_id}",
        headers=agent_headers,
    )
    assert visible_entry.status_code == 200


def test_agent_cannot_create_update_or_delete_knowledge(client):
    owner = register_user(client, "ownerpermissions")
    agent = register_user(client, "agentpermissions")

    organization_id = owner["organization_id"]
    owner_headers = auth_headers(owner["token"])
    agent_headers = auth_headers(agent["token"])

    membership = client.post(
        f"/api/v1/organizations/{organization_id}/members",
        headers=owner_headers,
        json={
            "user_id": agent["user_id"],
            "role": "agent",
        },
    )
    assert membership.status_code == 201, membership.text

    base_url = f"/api/v1/organizations/{organization_id}/knowledge"

    created = client.post(
        base_url,
        headers=owner_headers,
        json={
            "title": "Published article",
            "content": "An approved answer.",
            "is_published": True,
        },
    )
    assert created.status_code == 201, created.text
    entry_id = created.json()["id"]

    create_denied = client.post(
        base_url,
        headers=agent_headers,
        json={"title": "Unauthorized", "content": "Not allowed."},
    )
    assert create_denied.status_code == 403

    update_denied = client.patch(
        f"{base_url}/{entry_id}",
        headers=agent_headers,
        json={"title": "Unauthorized update"},
    )
    assert update_denied.status_code == 403

    delete_denied = client.delete(
        f"{base_url}/{entry_id}",
        headers=agent_headers,
    )
    assert delete_denied.status_code == 403


def test_knowledge_entries_are_isolated_between_organizations(client):
    owner_a = register_user(client, "isolationa")
    owner_b = register_user(client, "isolationb")

    url_a = (
        f"/api/v1/organizations/{owner_a['organization_id']}/knowledge"
    )
    url_b = (
        f"/api/v1/organizations/{owner_b['organization_id']}/knowledge"
    )

    created = client.post(
        url_a,
        headers=auth_headers(owner_a["token"]),
        json={
            "title": "Private organization information",
            "content": "This belongs only to organization A.",
            "is_published": True,
        },
    )
    assert created.status_code == 201, created.text
    entry_id = created.json()["id"]

    cross_org_read = client.get(
        f"{url_b}/{entry_id}",
        headers=auth_headers(owner_b["token"]),
    )
    assert cross_org_read.status_code == 404

    cross_org_update = client.patch(
        f"{url_b}/{entry_id}",
        headers=auth_headers(owner_b["token"]),
        json={"title": "Unauthorized"},
    )
    assert cross_org_update.status_code == 404

    list_b = client.get(
        url_b,
        headers=auth_headers(owner_b["token"]),
    )
    assert list_b.status_code == 200
    assert all(item["id"] != entry_id for item in list_b.json())


def test_update_rejects_null_title_and_content(client):
    owner = register_user(client, "nullvalidation")
    base_url = (
        f"/api/v1/organizations/{owner['organization_id']}/knowledge"
    )
    headers = auth_headers(owner["token"])

    created = client.post(
        base_url,
        headers=headers,
        json={
            "title": "Shipping information",
            "content": "Shipping takes three to five business days.",
        },
    )
    assert created.status_code == 201, created.text
    entry_id = created.json()["id"]

    for payload in ({"title": None}, {"content": None}):
        response = client.patch(
            f"{base_url}/{entry_id}",
            headers=headers,
            json=payload,
        )
        assert response.status_code == 422

def test_admin_can_publish_and_unpublish_knowledge_entry(client):
    owner = register_user(client, "publishowner")
    admin = register_user(client, "publishadmin")

    organization_id = owner["organization_id"]
    owner_headers = auth_headers(owner["token"])
    admin_headers = auth_headers(admin["token"])

    membership = client.post(
        f"/api/v1/organizations/{organization_id}/members",
        headers=owner_headers,
        json={
            "user_id": admin["user_id"],
            "role": "admin",
        },
    )
    assert membership.status_code == 201, membership.text

    base_url = f"/api/v1/organizations/{organization_id}/knowledge"

    created = client.post(
        base_url,
        headers=owner_headers,
        json={
            "title": "Customer support policy",
            "content": "Contact support for assistance.",
        },
    )
    assert created.status_code == 201, created.text

    entry_id = created.json()["id"]

    published = client.patch(
        f"{base_url}/{entry_id}",
        headers=admin_headers,
        json={"is_published": True},
    )
    assert published.status_code == 200, published.text
    assert published.json()["is_published"] is True

    unpublished = client.patch(
        f"{base_url}/{entry_id}",
        headers=admin_headers,
        json={"is_published": False},
    )
    assert unpublished.status_code == 200, unpublished.text
    assert unpublished.json()["is_published"] is False