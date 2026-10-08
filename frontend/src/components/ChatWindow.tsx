import type { Conversation } from "../types/conversation";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

export function ChatWindow({
  conversation,
  onSendMessage,
  isSending,
}: {
  conversation: Conversation | null;
  onSendMessage: (value: string) => void;
  isSending: boolean;
}) {
  if (!conversation) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
        Select a conversation or start a new one to begin.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active conversation</p>
          <h2 className="text-lg font-semibold text-slate-900">
            {conversation.title || "New support request"}
          </h2>
        </div>
        <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-700">
          {conversation.status}
        </span>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-4">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No messages yet. Ask a question to begin the conversation.
          </div>
        ) : (
          conversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>

      <MessageInput onSend={onSendMessage} isSending={isSending} />
    </div>
  );
}
