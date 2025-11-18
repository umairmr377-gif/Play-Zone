"use client";

import { ReactNode, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  duration?: number;
  icon?: ReactNode;
}

export default function Toast({
  message,
  variant = "info",
  onDismiss,
  duration = 5000,
  icon,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const variants = {
    success: {
      bg: "bg-success/10 border-success/30",
      text: "text-success",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    error: {
      bg: "bg-danger/10 border-danger/30",
      text: "text-danger",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    info: {
      bg: "bg-primary/10 border-primary/30",
      text: "text-primary",
      icon: <Info className="w-5 h-5" />,
    },
    warning: {
      bg: "bg-yellow-500/10 border-yellow-500/30",
      text: "text-yellow-600",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
  };

  const variantStyles = variants[variant];

  return (
    <div
      className={`
        glass-strong rounded-2xl border-2 p-4 shadow-neon-md
        flex items-center gap-3 min-w-[300px] max-w-md
        animate-slide-in
        ${variantStyles.bg}
      `}
    >
      <div className={`flex-shrink-0 ${variantStyles.text}`}>
        {icon || variantStyles.icon}
      </div>
      <p className={`flex-1 text-sm font-medium ${variantStyles.text}`}>
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${variantStyles.text} hover:opacity-70 transition-opacity p-1 rounded-lg hover:bg-white/20`}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

