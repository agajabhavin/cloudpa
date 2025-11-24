"use client";

export default function BillingPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Billing</h1>
      <div className="card p-6">
        <p className="text-gray-600 mb-4">
          Manage your subscription and billing settings.
        </p>
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Current Plan</h2>
            <p className="text-gray-600">Free Plan (MVP)</p>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Payment Method</h2>
            <p className="text-gray-600">No payment method on file</p>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-4">
              Stripe integration coming soon. For now, this is a placeholder.
            </p>
            <button
              className="btn-secondary"
              onClick={() => {
                alert("Stripe portal integration will be added here");
              }}
            >
              Manage Billing (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

