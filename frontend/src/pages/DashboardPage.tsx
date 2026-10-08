import { useCallback, useEffect, useMemo, useState } from "react";

import { ChatWindow } from "../components/ChatWindow";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ConversationList } from "../components/ConversationList";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";
import { conversationService } from "../services/conversationService";
import type { Conversation } from "../types/conversation";

export function DashboardPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setError(null);
    const items = await conversationService.listConversations();
    setConversations(items);
    return items;
  }, []);

  const openConversation = useCallback(async (conversationId: number) => {
    setSelectedId(conversationId);
    setActiveConversation(await conversationService.getConversation(conversationId));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadConversations()
      .then((items) => {
        if (!cancelled && items[0]) return openConversation(items[0].id);
        return undefined;
      })
      .catch((loadError) => {
        if (!cancelled) setError(getApiErrorMessage(loadError, "Unable to load your conversations."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadConversations, openConversation]);

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)),
    [conversations],
  );

  const handleNewConversation = async () => {
    const firstMessage = window.prompt("What do you need help with?");
    if (!firstMessage?.trim()) return;

    setIsCreating(true);
    setError(null);
    try {
      const created = await conversationService.createConversation({ first_message: firstMessage.trim() });
      setConversations((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setSelectedId(created.id);
      setActiveConversation(created);
    } catch (createError) {
      setError(getApiErrorMessage(createError, "Unable to create the conversation."));
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversation || activeConversation.status === "CLOSED") return;
    setIsSending(true);
    setError(null);
    try {
      const message = await conversationService.addMessage(activeConversation.id, { content });
      const updated = { ...activeConversation, messages: [...activeConversation.messages, message], updated_at: message.created_at };
      setActiveConversation(updated);
      setConversations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (sendError) {
      setError(getApiErrorMessage(sendError, "Unable to send your message. Please try again."));
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading your support workspace..." />;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-cyan-700">Customer workspace</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Good to see you, {user?.first_name || "there"}.
          </h1>
          <p className="mt-2 text-sm text-slate-600">Start a conversation and keep all your support history in one place.</p>
        </div>
        <button type="button" disabled={isCreating} onClick={() => void handleNewConversation()} className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-60">
          {isCreating ? "Creating..." : "+ New conversation"}
        </button>
      </header>

      <ErrorMessage message={error} />
      <div className="grid min-h-[620px] gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <ConversationList
          conversations={sortedConversations}
          selectedConversationId={selectedId}
          onSelectConversation={(id) => void openConversation(id)}
          onNewConversation={() => void handleNewConversation()}
        />
        <ChatWindow
          conversation={activeConversation}
          onSendMessage={(value) => void handleSendMessage(value)}
          isSending={isSending}
        />
      </div>
    </div>
  );
}
