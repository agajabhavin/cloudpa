"use client";

import { useState } from "react";
import Sidebar from "@/components/app/Sidebar";
import Topbar from "@/components/app/Topbar";
import MobileBottomNav from "@/components/app/MobileBottomNav";
import { ToastProvider } from "@/contexts/ToastContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ToastProvider>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Topbar - Full width header spanning entire screen */}
        <header className="flex-shrink-0 z-40 bg-white border-b border-gray-200">
          <Topbar collapsed={sidebarCollapsed} />
        </header>

      {/* Content area with sidebar and main content side by side */}
      <div className="flex-1 flex overflow-hidden min-h-0">
      {/* Desktop Sidebar - Completely hidden on mobile */}
      <aside
          className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 overflow-visible ${
            sidebarCollapsed ? "md:w-16" : "md:w-64"
        }`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>

      {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 min-w-0">
          <div className={`w-full h-full pt-4 pr-4 pb-4 md:pt-6 md:pr-6 md:pb-6 lg:pt-8 lg:pr-8 lg:pb-8 ${
            sidebarCollapsed ? "pl-4 md:pl-6 lg:pl-8" : "pl-0 md:pl-6 lg:pl-8"
          }`}>
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Only visible on mobile */}
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
    </ToastProvider>
  );
}
