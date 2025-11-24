export default function MessageThread({ messages }: { messages: any[] }) {
  return (
    <div className="card p-4 h-[calc(100vh-200px)] md:h-[60vh] overflow-y-auto grid gap-3 -mx-4 md:mx-0">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] rounded-xl p-3 ${
              m.direction === "OUT"
                ? "ml-auto bg-black text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <div className="text-sm">{m.text}</div>
            <div className={`text-xs mt-1 ${
              m.direction === "OUT" ? "text-gray-300" : "text-gray-500"
            }`}>
              {new Date(m.sentAt).toLocaleTimeString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
