from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.conversation.models import Conversation, ConversationStatus, Message, MessageSenderType
from app.conversation.schemas import ConversationCreate, ConversationRead, MessageCreate, MessageRead
from app.database import get_db
from app.user.models import User

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationRead])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Conversation]:
    return db.scalars(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    ).all()


@router.post("", response_model=ConversationRead, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Conversation:
    first_message = (payload.first_message or "").strip()
    if not first_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="first_message is required",
        )

    conversation = Conversation(
        user_id=current_user.id,
        title=(payload.title or first_message)[:255].strip() or None,
    )
    db.add(conversation)
    db.flush()

    db.add(
        Message(
            conversation_id=conversation.id,
            sender_id=current_user.id,
            sender_type=MessageSenderType.CUSTOMER,
            content=first_message,
        )
    )
    conversation.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/{conversation_id}", response_model=ConversationRead)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Conversation:
    conversation = db.get(Conversation, conversation_id)
    if conversation is None or conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    return conversation


@router.post("/{conversation_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
def create_message(
    conversation_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Message:
    conversation = db.get(Conversation, conversation_id)
    if conversation is None or conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    content = payload.content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty",
        )

    message = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        sender_type=MessageSenderType.CUSTOMER,
        content=content,
    )
    db.add(message)
    conversation.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(message)
    return message


@router.patch("/{conversation_id}/close", response_model=ConversationRead)
def close_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Conversation:
    conversation = db.get(Conversation, conversation_id)
    if conversation is None or conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    conversation.status = ConversationStatus.CLOSED
    conversation.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(conversation)
    return conversation
