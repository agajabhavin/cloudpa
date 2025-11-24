"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function FollowupScheduler({
  leadId,
  onSaved,
}: {
  leadId: string;
  onSaved: () => void;
}) {
  const [dueAt, setDueAt] = useState("");

  const setQuickFollowup = (hours: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    date.setMinutes(0);
    setDueAt(date.toISOString().slice(0, 16));
  };

  return (
    <div className="card p-4 grid gap-3">
      <div className="section-title">Follow-up</div>
      <div className="grid gap-2">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setQuickFollowup(24)}
            className="btn-secondary text-xs"
          >
            Tomorrow 10am
          </button>
          <button
            onClick={() => setQuickFollowup(48)}
            className="btn-secondary text-xs"
          >
            Day after
          </button>
          <button
            onClick={() => setQuickFollowup(168)}
            className="btn-secondary text-xs"
          >
            Next week
          </button>
        </div>
        <input
          className="input"
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
        <button
          className="btn"
          onClick={async () => {
            if (!dueAt) return;
            try {
              await api(`/leads/${leadId}/followup`, {
                method: "POST",
                body: JSON.stringify({
                  dueAt: new Date(dueAt).toISOString(),
                }),
              });
              setDueAt("");
              onSaved();
            } catch (e: any) {
              alert(e.message || "Failed to set follow-up");
            }
          }}
        >
          Set follow-up
        </button>
      </div>
    </div>
  );
}
