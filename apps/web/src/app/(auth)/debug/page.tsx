"use client";

import { useEffect, useState } from "react";
import { getApiUrl, setApiUrlOverride } from "@/lib/api";

export default function DebugPage() {
  const [info, setInfo] = useState<any>({});
  const [manualUrl, setManualUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const override = localStorage.getItem("CLOUDPA_API_URL");
      setManualUrl(override || "");
      
      setInfo({
        hostname: window.location.hostname,
        origin: window.location.origin,
        href: window.location.href,
        port: window.location.port,
        protocol: window.location.protocol,
        apiUrl: getApiUrl(),
        manualOverride: override || "none",
        userAgent: navigator.userAgent,
        env: {
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "not set",
        },
      });
    }
  }, []);

  const testApi = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test", password: "test" }),
      });
      const text = await response.text();
      setInfo((prev: any) => ({
        ...prev,
        apiTest: {
          status: response.status,
          statusText: response.statusText,
          body: text,
        },
      }));
    } catch (error: any) {
      setInfo((prev: any) => ({
        ...prev,
        apiTest: {
          error: error.message,
        },
      }));
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Debug Info</h1>
        
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Browser Info</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(info, null, 2)}
          </pre>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-2">API URL Detection</h2>
          <p className="text-sm">
            <strong>Detected API URL:</strong>{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {info.apiUrl || "Loading..."}
            </code>
          </p>
          <p className="text-sm mt-2">
            <strong>Current Hostname:</strong>{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {info.hostname || "Loading..."}
            </code>
          </p>
          <p className="text-sm mt-2">
            <strong>Full URL:</strong>{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
              {info.href || "Loading..."}
            </code>
          </p>
          <p className="text-sm mt-2">
            <strong>Manual Override:</strong>{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {info.manualOverride || "none"}
            </code>
          </p>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-2">Manual API URL Override</h2>
          <p className="text-sm text-gray-600 mb-2">
            If auto-detection fails, set the API URL manually:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="http://192.168.10.52:3001"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="input flex-1"
            />
            <button
              onClick={() => {
                if (manualUrl) {
                  setApiUrlOverride(manualUrl);
                  window.location.reload();
                } else {
                  setApiUrlOverride(null);
                  window.location.reload();
                }
              }}
              className="btn"
            >
              {manualUrl ? "Set" : "Clear"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This will be saved in localStorage and persist across page reloads.
          </p>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-2">API Test</h2>
          <button onClick={testApi} className="btn">
            Test API Connection
          </button>
          {info.apiTest && (
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto mt-2">
              {JSON.stringify(info.apiTest, null, 2)}
            </pre>
          )}
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-2">Instructions</h2>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Check the "Detected API URL" above - it should be <code>http://192.168.10.52:3001</code></li>
            <li>Click "Test API Connection" to verify connectivity</li>
            <li>Check browser console (Safari → Develop → Show Web Inspector)</li>
            <li>If API URL is wrong, the hostname detection might be failing</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

