export type MessageSenderType = "CUSTOMER" | "SUPPORT" | "ASSISTANT" | "SYSTEM";

export type ConversationStatus = "OPEN" | "CLOSED";

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number | null;
  sender_type: MessageSenderType;
  content: string;
  created_at: string;
};

export type Conversation = {
  id: number;
  user_id: number;
  title: string | null;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
  messages: Message[];
};

export type CreateConversationPayload = {
  title?: string;
  first_message?: string;
};

export type CreateMessagePayload = {
  content: string;
};
