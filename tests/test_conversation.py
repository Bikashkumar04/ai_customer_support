def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def register_user(client, email: str) -> str:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Test",
            "last_name": "User",
            "email": email,
            "password": "StrongPass123",
        },
    )
    assert response.status_code == 201
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StrongPass123"},
    )
    assert login_response.status_code == 200
    return login_response.json()["tokens"]["access_token"]


def test_create_and_fetch_conversation(client):
    token = register_user(client, "conv1@example.com")

    create_response = client.post(
        "/api/v1/conversations",
        headers=auth_header(token),
        json={"title": "Order issue", "first_message": "My order never arrived."},
    )
    assert create_response.status_code == 201
    payload = create_response.json()
    assert payload["title"] == "Order issue"
    assert payload["status"] == "OPEN"
    assert len(payload["messages"]) == 1

    list_response = client.get("/api/v1/conversations", headers=auth_header(token))
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    detail_response = client.get(
        f"/api/v1/conversations/{payload['id']}",
        headers=auth_header(token),
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["messages"][0]["content"] == "My order never arrived."


def test_user_cannot_access_other_user_conversation(client):
    first_token = register_user(client, "owner@example.com")
    second_token = register_user(client, "other@example.com")

    created = client.post(
        "/api/v1/conversations",
        headers=auth_header(first_token),
        json={"first_message": "Only owner should see this"},
    )
    conversation_id = created.json()["id"]

    assert client.get(
        f"/api/v1/conversations/{conversation_id}",
        headers=auth_header(second_token),
    ).status_code == 404


def test_add_message_and_close_conversation(client):
    token = register_user(client, "conv2@example.com")

    created = client.post(
        "/api/v1/conversations",
        headers=auth_header(token),
        json={"first_message": "I need help"},
    )
    conversation_id = created.json()["id"]

    msg_response = client.post(
        f"/api/v1/conversations/{conversation_id}/messages",
        headers=auth_header(token),
        json={"content": "Follow-up message"},
    )
    assert msg_response.status_code == 201
    assert msg_response.json()["content"] == "Follow-up message"

    close_response = client.patch(
        f"/api/v1/conversations/{conversation_id}/close",
        headers=auth_header(token),
    )
    assert close_response.status_code == 200
    assert close_response.json()["status"] == "CLOSED"


def test_conversation_requires_auth(client):
    assert client.get("/api/v1/conversations").status_code == 401
    assert client.post("/api/v1/conversations", json={"first_message": "Hi"}).status_code == 401
