"use client";

import { api } from "@/lib/api";

export default function ConvertToLeadButton({
  conversation,
  onConverted,
}: {
  conversation: any;
  onConverted: (path: string) => void;
}) {
  return (
    <button
      className="btn"
      onClick={async () => {
        try {
          const lead = await api<any>("/leads", {
            method: "POST",
            body: JSON.stringify({
              title:
                conversation.contact?.name ||
                conversation.contact?.handle ||
                "New Lead",
              contactId: conversation.contactId,
              conversationId: conversation.id,
            }),
          });
          onConverted(`/leads/${lead.id}`);
        } catch (e: any) {
          alert(e.message || "Failed to convert to lead");
        }
      }}
    >
      Convert to Lead
    </button>
  );
}

