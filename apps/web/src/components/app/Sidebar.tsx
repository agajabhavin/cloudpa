"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Icon components with size prop
const HomeIcon = ({ size = "w-5 h-5" }: { size?: string }) => (
  <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const MessageIcon = ({ size = "w-5 h-5" }: { size?: string }) => (
  <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const UsersIcon = ({ size = "w-5 h-5" }: { size?: string }) => (
  <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const FileTextIcon = ({ size = "w-5 h-5" }: { size?: string }) => (
  <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SettingsIcon = ({ size = "w-5 h-5" }: { size?: string }) => (
  <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number; label: string } | null>(null);

  const links = [
    { href: "/dashboard", label: "Home", icon: HomeIcon },
    { href: "/inbox", label: "Inbox", icon: MessageIcon },
    { href: "/leads", label: "Leads", icon: UsersIcon },
    { href: "/quotes", label: "Quotes", icon: FileTextIcon },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div
      className={`bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 overflow-visible ${
        collapsed ? "p-2" : "p-4 md:p-6"
      }`}
    >
      {/* Navigation Links - Scrollable area */}
      <nav className="flex-1 overflow-y-auto overflow-x-visible min-h-0 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname?.startsWith(link.href + "/");
          
          const linkContent = (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-xl transition-all duration-200 touch-target relative ${
                collapsed
                  ? "justify-center px-2 py-2.5"
                  : "px-3 py-2.5"
              } ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onMouseEnter={(e) => {
                if (collapsed) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPosition({
                    x: rect.right + 8,
                    y: rect.top + rect.height / 2,
                    label: link.label
                  });
                }
                setHoveredItem(link.href);
              }}
              onMouseLeave={() => {
                setHoveredItem(null);
                setTooltipPosition(null);
              }}
            >
              <Icon size={collapsed ? "w-6 h-6" : "w-5 h-5"} />
              {!collapsed && (
                <span className={`transition-all duration-200 ${isActive ? "text-blue-600" : "text-gray-700"}`}>
                  {link.label}
                </span>
              )}
            </Link>
          );

          return linkContent;
        })}
      </nav>

      {/* Collapse Toggle Button - Fixed at bottom */}
      <div className="flex-shrink-0 pt-3 border-t border-gray-200 mt-auto">
        <button
          onClick={onToggleCollapse}
          onMouseEnter={(e) => {
            if (collapsed) {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({
                x: rect.right + 8,
                y: rect.top + rect.height / 2,
                label: "Expand"
              });
            }
            setHoveredItem("collapse");
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            setTooltipPosition(null);
          }}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 text-sm font-medium ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
      
      {/* Tooltip - Rendered outside overflow container using fixed positioning */}
      {collapsed && tooltipPosition && hoveredItem && (
        <div
          className="fixed px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-[9999] whitespace-nowrap pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {tooltipPosition.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      )}
    </div>
  );
}
