import { api } from "./api";
import type { CreateConversationPayload, CreateMessagePayload, Conversation } from "../types/conversation";

export const conversationService = {
  listConversations: async () => {
    const response = await api.get<Conversation[]>("/api/v1/conversations");
    return response.data;
  },

  createConversation: async (payload: CreateConversationPayload) => {
    const response = await api.post<Conversation>("/api/v1/conversations", payload);
    return response.data;
  },

  getConversation: async (conversationId: number) => {
    const response = await api.get<Conversation>(`/api/v1/conversations/${conversationId}`);
    return response.data;
  },

  addMessage: async (conversationId: number, payload: CreateMessagePayload) => {
    const response = await api.post(`/api/v1/conversations/${conversationId}/messages`, payload);
    return response.data;
  },
};
