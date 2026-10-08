from fastapi import APIRouter, Depends

from app.auth.dependencies import require_admin, require_customer, require_support
from app.database import get_db
from app.main import app
from app.user.models import Role, User


router = APIRouter(prefix="/test-permissions", tags=["test-permissions"])


@router.get("/customer")
def customer_only(_: object = Depends(require_customer)):
    return {"ok": True}


@router.get("/support")
def support_or_admin(_: object = Depends(require_support)):
    return {"ok": True}


@router.get("/admin")
def admin_only(_: object = Depends(require_admin)):
    return {"ok": True}


app.include_router(router)


def register_user(client, email: str, role: Role) -> str:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "first_name": role.value.title(),
            "last_name": "User",
            "email": email,
            "password": "StrongPass123",
        },
    )
    assert response.status_code == 201

    db_override = client.app.dependency_overrides[get_db]
    db_generator = db_override()
    db = next(db_generator)
    try:
        user = db.get(User, response.json()["user"]["id"])
        user.role = role
        db.commit()
    finally:
        db_generator.close()

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StrongPass123"},
    )
    assert login_response.status_code == 200
    return login_response.json()["tokens"]["access_token"]


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_customer_route_requires_customer_role(client):
    customer_token = register_user(client, "customer@example.com", Role.CUSTOMER)
    support_token = register_user(client, "support@example.com", Role.SUPPORT)

    assert client.get("/test-permissions/customer", headers=auth_header(customer_token)).status_code == 200
    assert client.get("/test-permissions/customer", headers=auth_header(support_token)).status_code == 403


def test_support_route_allows_support_and_admin(client):
    customer_token = register_user(client, "customer2@example.com", Role.CUSTOMER)
    support_token = register_user(client, "support2@example.com", Role.SUPPORT)
    admin_token = register_user(client, "admin2@example.com", Role.ADMIN)

    assert client.get("/test-permissions/support", headers=auth_header(customer_token)).status_code == 403
    assert client.get("/test-permissions/support", headers=auth_header(support_token)).status_code == 200
    assert client.get("/test-permissions/support", headers=auth_header(admin_token)).status_code == 200


def test_admin_route_requires_admin_role(client):
    support_token = register_user(client, "support3@example.com", Role.SUPPORT)
    admin_token = register_user(client, "admin3@example.com", Role.ADMIN)

    assert client.get("/test-permissions/admin", headers=auth_header(support_token)).status_code == 403
    assert client.get("/test-permissions/admin", headers=auth_header(admin_token)).status_code == 200


def test_role_routes_reject_missing_token(client):
    assert client.get("/test-permissions/admin").status_code == 401
