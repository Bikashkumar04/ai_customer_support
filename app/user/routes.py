from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.schemas import UserRead, UserProfileUpdate
from app.database import get_db
from app.user.models import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def get_my_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserRead)
def update_my_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    updates = payload.model_dump(exclude_unset=True)
    new_email = None

    if "email" in updates:
        new_email = str(updates["email"]).strip().lower()
        existing_user = db.scalar(select(User).where(func.lower(User.email) == new_email))
        if existing_user is not None and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )
        current_user.email = new_email

    if "first_name" in updates:
        current_user.first_name = str(updates["first_name"]).strip()

    if "last_name" in updates:
        current_user.last_name = str(updates["last_name"]).strip()

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
