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
      bg: "bg-[#0A0A0C]/95 backdrop-blur-xl border-white/10",
      text: "text-white",
      iconBg: "bg-[#0C0C10] border-white/10",
      icon: <CheckCircle2 className="w-5 h-5 text-white/80" />,
    },
    error: {
      bg: "bg-[#0A0A0C]/95 backdrop-blur-xl border-white/10",
      text: "text-white",
      iconBg: "bg-[#0C0C10] border-white/10",
      icon: <AlertCircle className="w-5 h-5 text-white/80" />,
    },
    info: {
      bg: "bg-[#0A0A0C]/95 backdrop-blur-xl border-white/10",
      text: "text-white",
      iconBg: "bg-[#0C0C10] border-white/10",
      icon: <Info className="w-5 h-5 text-white/80" />,
    },
    warning: {
      bg: "bg-[#0A0A0C]/95 backdrop-blur-xl border-white/10",
      text: "text-white",
      iconBg: "bg-[#0C0C10] border-white/10",
      icon: <AlertTriangle className="w-5 h-5 text-white/80" />,
    },
  };

  const variantStyles = variants[variant];

  return (
    <div
      className={`
        ${variantStyles.bg} rounded-2xl border p-4 shadow-[0_12px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]
        flex items-center gap-3 min-w-[300px] max-w-md
        animate-slide-in
      `}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${variantStyles.iconBg} border flex items-center justify-center`}>
        {icon || variantStyles.icon}
      </div>
      <p className={`flex-1 text-sm font-medium ${variantStyles.text} tracking-wide`}>
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-white/40 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/5"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

