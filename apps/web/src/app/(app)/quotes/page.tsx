"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all quotes by getting all leads and their quotes
    api<any[]>("/leads")
      .then((leads) => {
        const allQuotes: any[] = [];
        leads.forEach((lead) => {
          if (lead.quotes && lead.quotes.length > 0) {
            allQuotes.push(...lead.quotes);
          }
        });
        setQuotes(allQuotes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="page-title">Quotes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and track all your quotes
        </p>
      </div>
      {quotes.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          No quotes yet. Create a quote from a lead detail page.
        </div>
      ) : (
        <div className="grid gap-3">
          {quotes.map((quote) => (
            <Link
              key={quote.id}
              href={`/quotes/${quote.id}`}
              className="card p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Quote #{quote.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      quote.status === "ACCEPTED"
                        ? "bg-green-100 text-green-800"
                        : quote.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : quote.status === "SENT"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {quote.status}
                  </span>
                  <span className="text-lg font-semibold">
                    ${quote.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

