"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import ConversationList from "@/components/inbox/ConversationList";

export default function InboxPage() {
  const [convos, setConvos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<any[]>("/messaging/conversations")
      .then(setConvos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="page-title">Inbox</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage conversations and convert them to leads
        </p>
      </div>
      {convos.length === 0 ? (
        <div className="card p-6 md:p-8 text-center">
          <div className="text-lg font-medium mb-2">No conversations yet</div>
          <div className="text-sm text-gray-500 mb-4">
            Connect WhatsApp Sandbox and send a test message to see it here.
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Make sure your Twilio WhatsApp webhook is configured to point to:
            <br />
            <code className="bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
              {typeof window !== "undefined" 
                ? `${window.location.origin}/api/v1/messaging/webhook/whatsapp`
                : "/api/v1/messaging/webhook/whatsapp"}
            </code>
          </div>
        </div>
      ) : (
        <ConversationList conversations={convos} />
      )}
    </div>
  );
}

