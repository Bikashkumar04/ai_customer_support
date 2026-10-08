import type { Conversation } from "../types/conversation";

export function Sidebar({
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
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
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

      <div className="flex-1 space-y-3 p-3">
        {conversations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No conversations yet. Start one to get support.
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                selectedConversationId === conversation.id
                  ? "border-cyan-200 bg-cyan-50"
                  : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {conversation.title || "Untitled conversation"}
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                  {conversation.status}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                {conversation.messages.at(-1)?.content ?? "No messages yet"}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
