import type { Conversation } from "../types/conversation";

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const preview = conversation.messages.at(-1)?.content ?? "No messages yet";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left transition ${
        isSelected
          ? "border-cyan-200 bg-cyan-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-slate-800">
          {conversation.title || "Untitled conversation"}
        </p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
          {conversation.status}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-slate-500">{preview}</p>
      <p className="mt-2 text-[11px] text-slate-400">
        {new Date(conversation.updated_at).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>
    </button>
  );
}
