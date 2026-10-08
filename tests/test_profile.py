from app.user.models import Role


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def register_user(client, email: str, first_name: str = "Jane", last_name: str = "Doe") -> str:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "first_name": first_name,
            "last_name": last_name,
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


def test_get_profile_returns_current_user(client):
    token = register_user(client, "profile@example.com", "Ada", "Lovelace")

    response = client.get("/api/v1/users/me", headers=auth_header(token))

    assert response.status_code == 200
    payload = response.json()
    assert payload["email"] == "profile@example.com"
    assert payload["first_name"] == "Ada"
    assert payload["last_name"] == "Lovelace"
    assert payload["role"] == Role.CUSTOMER.value


def test_update_profile_updates_fields_and_prevents_duplicate_email(client):
    token = register_user(client, "old@example.com", "Old", "Name")
    second_token = register_user(client, "other@example.com", "Other", "User")

    response = client.patch(
        "/api/v1/users/me",
        headers=auth_header(token),
        json={"first_name": "Updated", "last_name": "User", "email": "updated@example.com"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["first_name"] == "Updated"
    assert payload["last_name"] == "User"
    assert payload["email"] == "updated@example.com"

    conflict = client.patch(
        "/api/v1/users/me",
        headers=auth_header(second_token),
        json={"email": "updated@example.com"},
    )
    assert conflict.status_code == 409


def test_profile_requires_auth(client):
    assert client.get("/api/v1/users/me").status_code == 401
    assert client.patch("/api/v1/users/me", json={"first_name": "New"}).status_code == 401
