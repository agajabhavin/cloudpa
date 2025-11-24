"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function QuoteBuilder({
  leadId,
  onCreated,
}: {
  leadId: string;
  onCreated: () => void;
}) {
  const [items, setItems] = useState([{ name: "", qty: 1, price: 0 }]);

  return (
    <div className="card p-4 grid gap-3">
      <div className="section-title">Create Quote</div>
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <input
            className="input"
            placeholder="Item"
            value={it.name}
            onChange={(e) => {
              const c = [...items];
              c[i].name = e.target.value;
              setItems(c);
            }}
          />
          <input
            className="input"
            type="number"
            placeholder="Qty"
            value={it.qty}
            onChange={(e) => {
              const c = [...items];
              c[i].qty = Number(e.target.value);
              setItems(c);
            }}
          />
          <input
            className="input"
            type="number"
            placeholder="Price"
            value={it.price}
            onChange={(e) => {
              const c = [...items];
              c[i].price = Number(e.target.value);
              setItems(c);
            }}
          />
        </div>
      ))}
      <button
        className="btn-secondary"
        onClick={() => setItems([...items, { name: "", qty: 1, price: 0 }])}
      >
        + Add item
      </button>
      <button
        className="btn"
        onClick={async () => {
          try {
            const quote = await api(`/leads/${leadId}/quotes`, {
              method: "POST",
              body: JSON.stringify({ items }),
            });
            setItems([{ name: "", qty: 1, price: 0 }]);
            onCreated();
            // Optionally navigate to quote detail page
            // window.location.href = `/quotes/${quote.id}`;
          } catch (e: any) {
            alert(e.message || "Failed to create quote");
          }
        }}
      >
        Create Quote
      </button>
    </div>
  );
}

