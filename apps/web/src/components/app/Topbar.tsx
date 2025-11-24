"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProfileDropdown from "./ProfileDropdown";

interface TopbarProps {
  collapsed?: boolean;
}

export default function Topbar({ collapsed = false }: TopbarProps) {
  const [org, setOrg] = useState<any>(null);

  useEffect(() => {
    api("/org/me", { silent: true })
      .then(setOrg)
      .catch((error: any) => {
        // Silently handle 404s - endpoint may not exist yet
        if (!error.silent && !error.message?.includes("404") && !error.message?.includes("Cannot GET")) {
          console.error("Failed to load organization:", error);
        }
      });
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 w-full sticky top-0 z-50 relative">
      <div className={`py-4 md:py-6 ${collapsed ? 'pl-16 pr-4 md:pr-6 lg:pr-8' : 'px-4 md:px-6 lg:px-8'}`}>
        <div className="flex items-center justify-between">
          {/* Left side - Brand/Title */}
          <div className="flex items-center transition-all duration-300">
            {collapsed ? (
              <div className="absolute left-8 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm -translate-x-1/2">
                CP
              </div>
            ) : (
              <div className="space-y-0.5">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-600 tracking-tight">
              Cloud PA
            </h1>
                <p className="text-xs text-gray-500">Micro CRM</p>
              </div>
            )}
          </div>

          {/* Right side - Profile */}
          <div className="flex items-center gap-3 md:gap-4">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </div>
  );
}
