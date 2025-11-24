"use client";

import { useState } from "react";

export default function MessageInput({
  onSend,
}: {
  onSend: (t: string) => Promise<void>;
}) {
  const [text, setText] = useState("");

  return (
    <div className="flex gap-2 p-2 bg-white border-t border-gray-200 safe-bottom">
      <input
        className="input flex-1"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (text.trim()) {
              onSend(text);
              setText("");
            }
          }
        }}
        placeholder="Type your reply…"
        autoFocus={false}
      />
      <button
        className="btn btn-sm flex-shrink-0"
        onClick={async () => {
          if (!text.trim()) return;
          await onSend(text);
          setText("");
        }}
        disabled={!text.trim()}
      >
        Send
      </button>
    </div>
  );
}
