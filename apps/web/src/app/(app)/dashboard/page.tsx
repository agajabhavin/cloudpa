"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

type DashboardDTO = {
  leadsThisWeek: number;
  wonRatio: number;
  avgResponseTime: number;
  overdueFollowups: number;
  quoteAcceptance: number;
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardDTO | null>(null);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [todayQueue, setTodayQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const [k, o, l, tq] = await Promise.all([
          api<DashboardDTO>("/analytics/dashboard", { silent: true }).catch(() => null),
          api<any[]>("/followups/overdue", { silent: true }).catch(() => []),
          api<any[]>("/leads", { silent: true }).catch(() => []),
          api<any[]>("/automation/today-queue", { silent: true }).catch(() => []), // Today queue (optional)
        ]);
        setKpis(k);
        setOverdue(o || []);
        setRecentLeads((l || []).slice(0, 5));
        setTodayQueue(tq || []);
      } catch (e: any) {
        // Only show error if it's not a 404 (expected when endpoints don't exist)
        if (!e.message?.includes("404") && !e.message?.includes("Cannot GET")) {
        console.error("Dashboard error:", e);
        setError(e.message || "Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const winRatePct = useMemo(
    () => (kpis ? (kpis.wonRatio * 100).toFixed(1) : "0.0"),
    [kpis]
  );
  const quoteAccPct = useMemo(
    () => (kpis ? (kpis.quoteAcceptance * 100).toFixed(1) : "0.0"),
    [kpis]
  );

  if (loading) return <div className="p-6">Loading…</div>;

  if (error) {
    return (
      <div className="grid gap-4 p-6">
        <div className="card p-6 border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Connection Error</h2>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <div className="text-sm text-red-600">
            <p className="mb-2">To fix this:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Make sure the API server is running on port 3001</li>
              <li>Check that the API server started successfully</li>
              <li>Try refreshing this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your control center for today's conversations, leads, and quotes.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link href="/inbox" className="btn">Go to Inbox</Link>
          <Link href="/leads" className="btn-secondary">View Leads</Link>
        </div>
      </div>

            {/* KPI Strip - Mobile: 2 columns, Desktop: 4 columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          title="Leads This Week"
          value={kpis?.leadsThisWeek ?? 0}
          href="/leads"
          subtitle="New leads created"
        />
        <KpiCard
          title="Win Rate"
          value={`${winRatePct}%`}
          href="/leads?stage=WON"
          subtitle="Closed won vs lost"
        />
        <KpiCard
          title="Overdue Follow-ups"
          value={kpis?.overdueFollowups ?? 0}
          href="/leads"
          subtitle="Need attention today"
          danger={(kpis?.overdueFollowups ?? 0) > 0}
        />
        <KpiCard
          title="Quote Acceptance"
          value={`${quoteAccPct}%`}
          href="/leads?stage=QUOTED"
          subtitle="Accepted vs sent"
        />
      </div>

      {/* Today Queue + Recent Activity - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Today Queue - Next Best Actions */}
        <div className="card p-5 lg:col-span-2 grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Today's Money List</h2>
            <span className="text-xs text-gray-500">
              Prioritized actions for revenue
            </span>
          </div>

          {todayQueue.length === 0 && overdue.length === 0 ? (
            <EmptyState
              title="All caught up! 🎉"
              subtitle="No urgent actions needed. Check your inbox for new conversations."
              ctaHref="/inbox"
              ctaText="Check Inbox"
            />
          ) : (
            <div className="grid gap-2">
              {/* Show Today Queue items first */}
              {todayQueue.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={item.actionUrl}
                  className="flex items-center justify-between rounded-xl border bg-white p-3 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{item.title}</div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.type === "overdue_followup" ? "bg-red-100 text-red-700" :
                        item.type === "price_resistance" ? "bg-orange-100 text-orange-700" :
                        item.type === "high_value_lead" ? "bg-green-100 text-green-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {item.type.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{item.subtitle}</div>
                  </div>
                </Link>
              ))}
              {/* Fallback to overdue if no queue items */}
              {todayQueue.length === 0 && overdue.map((f) => (
                <Link
                  key={f.id}
                  href={`/leads/${f.leadId}`}
                  className="flex items-center justify-between rounded-xl border bg-white p-3 hover:bg-gray-50"
                >
                  <div>
                    <div className="text-sm font-medium">{f.lead.title}</div>
                    <div className="text-xs text-gray-500">
                      Due {new Date(f.dueAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-red-600">
                    Overdue
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="card p-5 grid gap-4">
          <h2 className="font-semibold">Recent Leads</h2>

          {recentLeads.length === 0 ? (
            <EmptyState
              title="No leads yet"
              subtitle="Convert chats to leads from your Inbox."
              ctaHref="/inbox"
              ctaText="Open Inbox"
            />
          ) : (
            <div className="grid gap-2">
              {recentLeads.map((l) => (
                <Link
                  key={l.id}
                  href={`/leads/${l.id}`}
                  className="rounded-xl border bg-white p-3 hover:bg-gray-50"
                >
                  <div className="text-sm font-medium">{l.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {l.stage} • {new Date(l.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  href,
  danger,
}: {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  href: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card p-4 grid gap-1 hover:shadow-md transition ${
        danger ? "border-red-200" : ""
      }`}
    >
      <div className="text-sm text-gray-600">{title}</div>
      <div className={`text-3xl font-semibold ${danger ? "text-red-600" : ""}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </Link>
  );
}

function EmptyState({
  title,
  subtitle,
  ctaHref,
  ctaText,
}: {
  title: string;
  subtitle: string;
  ctaHref: string;
  ctaText: string;
}) {
  return (
    <div className="rounded-xl border border-dashed p-4 text-center grid gap-2">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
      <Link href={ctaHref} className="btn w-fit mx-auto">
        {ctaText}
      </Link>
    </div>
  );
}
