from datetime import datetime

from pydantic import BaseModel, Field

from app.conversation.models import ConversationStatus, MessageSenderType


class MessageRead(BaseModel):
    id: int
    conversation_id: int
    sender_id: int | None
    sender_type: MessageSenderType
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=20000)


class ConversationCreate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    first_message: str | None = Field(default=None, min_length=1, max_length=20000)


class ConversationRead(BaseModel):
    id: int
    user_id: int
    title: str | None
    status: ConversationStatus
    created_at: datetime
    updated_at: datetime
    messages: list[MessageRead] = []

    model_config = {"from_attributes": True}
