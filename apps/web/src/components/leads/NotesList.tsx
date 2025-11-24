"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function NotesList({
  lead,
  onChanged,
}: {
  lead: any;
  onChanged: () => void;
}) {
  const [text, setText] = useState("");

  return (
    <div className="card p-4 grid gap-3">
      <div className="section-title">Notes</div>
      <div className="grid gap-2">
        {lead.notes && lead.notes.length > 0 ? (
          lead.notes.map((n: any) => (
            <div key={n.id} className="rounded-xl border bg-gray-50 p-3 text-sm">
              <div className="text-gray-900">{n.text}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            No notes yet. Add your first note below.
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <textarea
          className="input"
          placeholder="Add a note about this lead…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <button
          className="btn"
          onClick={async () => {
            if (!text.trim()) return;
            try {
              await api(`/leads/${lead.id}/notes`, {
                method: "POST",
                body: JSON.stringify({ text }),
              });
              setText("");
              onChanged();
            } catch (e: any) {
              alert(e.message || "Failed to add note");
            }
          }}
        >
          Add note
        </button>
      </div>
    </div>
  );
}
