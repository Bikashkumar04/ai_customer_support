import type { Conversation } from "../types/conversation";
import { ConversationItem } from "./ConversationItem";

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: {
  conversations: Conversation[];
  selectedConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  onNewConversation: () => void;
}) {
  return (
    <aside className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Conversations
        </h2>
        <button
          type="button"
          onClick={onNewConversation}
          className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700"
        >
          + New Chat
        </button>
      </div>

      <div className="space-y-3 p-3">
        {conversations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No conversations yet. Start a new one.
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedConversationId}
              onSelect={() => onSelectConversation(conversation.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
