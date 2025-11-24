import LeadCard from "./LeadCard";

export default function LeadColumn({
  stage,
  leads,
}: {
  stage: string;
  leads: any[];
}) {
  const stageColors: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700",
    CONTACTED: "bg-yellow-50 text-yellow-700",
    QUOTED: "bg-blue-50 text-blue-700",
    WON: "bg-green-50 text-green-700",
    LOST: "bg-red-50 text-red-700",
  };

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-3">
        <div className={`text-xs font-semibold px-2 py-1 rounded ${stageColors[stage] || "bg-gray-50 text-gray-700"}`}>
          {stage}
        </div>
        <div className="text-xs text-gray-500">{leads.length}</div>
      </div>
      <div className="grid gap-2">
        {leads.map((l) => (
          <LeadCard key={l.id} lead={l} />
        ))}
      </div>
    </div>
  );
}
