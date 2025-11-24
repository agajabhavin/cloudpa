import Link from "next/link";

export default function LeadCard({ lead }: { lead: any }) {
  return (
    <Link
      href={`/leads/${lead.id}`}
      className="card p-3 hover:shadow-md transition-shadow"
    >
      <div className="font-semibold text-sm text-gray-900 mb-1">{lead.title}</div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {new Date(lead.createdAt).toLocaleDateString()}
        </div>
        {lead.followups && lead.followups.length > 0 && (
          <div className="text-xs text-orange-600 font-medium">
            {lead.followups.filter((f: any) => !f.doneAt).length} follow-up{lead.followups.filter((f: any) => !f.doneAt).length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Link>
  );
}
