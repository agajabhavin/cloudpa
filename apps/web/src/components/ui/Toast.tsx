"use client";

import { useEffect, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true); // Start visible for immediate rendering
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  }, [toast.id, onRemove]);

  useEffect(() => {
    // Ensure visibility is set (redundant but safe)
    setIsVisible(true);

    // Auto-dismiss timer
    const duration = toast.duration ?? (toast.type === "error" ? 5000 : 3000);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setProgress((remaining / duration) * 100);

      if (remaining === 0) {
        handleDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration, toast.type, handleDismiss]);

  const getToastStyles = () => {
    const baseStyles = "w-full md:min-w-[320px] md:max-w-md rounded-lg shadow-lg border p-4 relative overflow-hidden";
    const typeStyles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-amber-50 border-amber-200 text-amber-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
    };
    return `${baseStyles} ${typeStyles[toast.type]}`;
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    switch (toast.type) {
      case "success":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "error":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "warning":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "info":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`${getToastStyles()} ${
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-[120%] opacity-0"
      } transition-all duration-300 ease-out transform`}
      role="alert"
      aria-live="assertive"
      style={{ 
        transform: isVisible && !isLeaving ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible && !isLeaving ? 1 : 0
      }}
    >
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-50 ease-linear"
        style={{ width: `${progress}%` }}
      />

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5">{toast.message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity ml-2"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

