import { useState } from "react";

import { Button } from "./Button";

export function MessageInput({
  onSend,
  isSending,
}: {
  onSend: (value: string) => void;
  isSending: boolean;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-slate-200 bg-white p-4">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={1}
        placeholder="Type your message..."
        className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
      />
      <Button type="submit" isLoading={isSending} className="shrink-0">
        Send
      </Button>
    </form>
  );
}
