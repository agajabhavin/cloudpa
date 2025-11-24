"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import LeadBoard from "@/components/leads/LeadBoard";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<any[]>("/leads")
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="grid gap-4 pb-4">
      <div>
        <h1 className="page-title">Leads</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage your sales pipeline
        </p>
      </div>
      {leads.length === 0 ? (
        <div className="card p-6 md:p-8 text-center">
          <div className="text-lg font-medium mb-2">No leads yet</div>
          <div className="text-sm text-gray-500 mb-4">
            Convert conversations to leads from your Inbox
          </div>
          <Link href="/inbox" className="btn w-full md:w-fit mx-auto">
            Go to Inbox
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <LeadBoard leads={leads} />
        </div>
      )}
    </div>
  );
}
