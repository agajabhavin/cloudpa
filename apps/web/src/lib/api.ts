// Auto-detect API URL based on current hostname
// Works for localhost, network IP, and production
export const getApiUrl = () => {
  if (typeof window !== "undefined") {
    // Check for manual override in localStorage (for mobile testing)
    const manualOverride = localStorage.getItem("CLOUDPA_API_URL");
    if (manualOverride) {
      console.log("[getApiUrl] Using manual override from localStorage:", manualOverride);
      return manualOverride;
    }
    
    // Client-side: use current hostname
    const hostname = window.location.hostname;
    const origin = window.location.origin;
    const port = window.location.port;
    const href = window.location.href;
    
    // Debug logging - always log to help diagnose
    console.log("[getApiUrl] Detection:", {
      hostname,
      origin,
      port,
      href,
      env: process.env.NEXT_PUBLIC_API_URL,
    });
    
    // If environment variable is set, use it (highest priority)
    if (process.env.NEXT_PUBLIC_API_URL) {
      console.log("[getApiUrl] Using env var:", process.env.NEXT_PUBLIC_API_URL);
      return process.env.NEXT_PUBLIC_API_URL;
    }
    
    // Extract IP from href if hostname is localhost but we're on a network IP
    // This handles cases where hostname might be wrong but href has the correct IP
    let detectedHostname = hostname;
    const ipMatch = href.match(/https?:\/\/(\d+\.\d+\.\d+\.\d+)/);
    if (ipMatch && (hostname === "localhost" || hostname === "127.0.0.1")) {
      detectedHostname = ipMatch[1];
      console.log("[getApiUrl] Extracted IP from href:", detectedHostname);
    }
    
    // If hostname is localhost or 127.0.0.1, use localhost
    if (detectedHostname === "localhost" || detectedHostname === "127.0.0.1") {
      console.log("[getApiUrl] Detected localhost, using localhost:3001");
      return "http://localhost:3001";
    }
    
    // For network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x) or any other hostname
    // Use the same hostname with API port 3001
    const apiUrl = `http://${detectedHostname}:3001`;
    console.log("[getApiUrl] Using detected hostname for API:", apiUrl);
    return apiUrl;
  }
  // Server-side: use env or default
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
};

// Helper function to set manual API URL override (for mobile testing)
export const setApiUrlOverride = (url: string | null) => {
  if (typeof window !== "undefined") {
    if (url) {
      localStorage.setItem("CLOUDPA_API_URL", url);
      console.log("[getApiUrl] Set manual override:", url);
    } else {
      localStorage.removeItem("CLOUDPA_API_URL");
      console.log("[getApiUrl] Removed manual override");
    }
  }
};

const API_PREFIX = "/api/v1";

export async function api<T>(path: string, init?: RequestInit & { silent?: boolean }): Promise<T> {
  const silent = init?.silent ?? false;
  const { silent: _, ...fetchInit } = init || {};
  // Compute API URL dynamically on each call to handle network IP changes
  const API_URL = getApiUrl();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  // Ensure path starts with / and add API prefix
  const fullPath = path.startsWith("/") ? `${API_PREFIX}${path}` : `${API_PREFIX}/${path}`;
  const url = `${API_URL}${fullPath}`;
  
  // Prepare headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers || {}),
  };
  
  try {
    const res = await fetch(url, {
      ...fetchInit,
      headers,
      cache: "no-store",
    });
    
    if (!res.ok) {
      const text = await res.text();
      let errorMessage = text || `HTTP ${res.status}`;
      
      // Try to parse as JSON for better error messages
      try {
        const errorJson = JSON.parse(text);
        errorMessage = errorJson.message || errorJson.error || text;
      } catch {
        // Not JSON, use text as-is
      }
      
      // Only log non-404 errors to reduce console noise
      // 404s are expected when endpoints don't exist yet
      if (res.status !== 404 && !silent) {
      console.error("[API] Error:", {
        status: res.status,
        message: errorMessage,
        url,
      });
      }
      
      // For silent mode, return a special error that won't be logged
      if (silent && res.status === 404) {
        const silentError = new Error(errorMessage);
        (silentError as any).silent = true;
        throw silentError;
      }
      
      throw new Error(errorMessage);
    }
    const data = await res.json();
    return data;
  } catch (error: any) {
    // Handle network errors (API server not running, CORS, etc.)
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const networkError = `Cannot connect to API server at ${API_URL}. Make sure the API server is running on port 3001.`;
      console.error("[API] Network Error:", {
        url,
        apiUrl: API_URL,
        hostname: typeof window !== "undefined" ? window.location.hostname : "server",
        error: error.message,
      });
      throw new Error(networkError);
    }
    // Only log non-404 errors to reduce console noise
    if (!error.message?.includes("404") && !error.message?.includes("Cannot GET")) {
    console.error("[API] Request Error:", {
      url,
      error: error.message,
      stack: error.stack,
    });
    }
    throw error;
  }
}

