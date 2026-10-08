import type { Message } from "../types/conversation";

export function MessageBubble({ message }: { message: Message }) {
  const isCustomerMessage = message.sender_type === "CUSTOMER";

  return (
    <div className={`flex ${isCustomerMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
          isCustomerMessage
            ? "bg-cyan-600 text-white"
            : "border border-slate-200 bg-slate-50 text-slate-800"
        }`}
      >
        <div className="mb-1 flex items-center justify-between gap-4 text-[10px] uppercase tracking-wide opacity-80">
          <span>{isCustomerMessage ? "You" : message.sender_type}</span>
          <span>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
