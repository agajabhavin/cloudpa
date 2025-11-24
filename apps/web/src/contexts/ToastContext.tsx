"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Toast, { Toast as ToastType, ToastType as ToastTypeEnum } from "@/components/ui/Toast";

interface ToastContextType {
  showToast: (type: ToastTypeEnum, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastTypeEnum, message: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastType = { id, type, message, duration };
      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Debug: Log when toast is added
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Toast] Added ${type} toast:`, message, `Total toasts: ${updated.length}`);
        }
        return updated;
      });
    },
    []
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast("success", message, duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast("error", message, duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast("warning", message, duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast("info", message, duration),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Container - Fixed position top-right, responsive */}
      {toasts.length > 0 && (
        <div 
          className="fixed top-4 right-4 left-4 md:left-auto z-[9999] flex flex-col gap-2 pointer-events-none max-w-md md:max-w-none"
          style={{ zIndex: 9999 }}
        >
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} onRemove={removeToast} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

