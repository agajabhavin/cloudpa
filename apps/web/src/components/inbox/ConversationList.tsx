import Link from "next/link";

export default function ConversationList({
  conversations,
}: {
  conversations: any[];
}) {
  return (
    <div className="grid gap-2">
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`/inbox/${c.id}`}
          className="card p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">
                {c.contact?.name || c.contact?.handle || "Unknown"}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {new Date(c.lastMessageAt || c.createdAt).toLocaleString()}
              </div>
            </div>
            {c.lastMessageAt && (
              <div className="text-xs text-blue-600 font-medium">
                Active
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
