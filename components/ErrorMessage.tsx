"use client";

import { AlertCircle, X } from "lucide-react";
import Button from "./Button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean; // For Server Components - will reload page
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  showRetry = false,
  onDismiss,
  className = "",
}: ErrorMessageProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (showRetry) {
      // Default retry for Server Components - reload the page
      window.location.reload();
    }
  };

  const hasRetry = onRetry || showRetry;

  return (
    <div
      className={`bg-[#0A0A0C]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] ${className} animate-slide-in`}
    >
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-xl bg-[#0C0C10] border border-white/10 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-white/80" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-display font-bold text-white mb-2 tracking-tight">{title}</h3>
          <p className="text-sm text-white/70 mb-5 font-light leading-relaxed">{message}</p>
          <div className="flex gap-3">
            {hasRetry && (
              <Button size="sm" variant="primary" onClick={handleRetry}>
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="outline"
                onClick={onDismiss}
                className="border-white/20 text-white/70 hover:border-white/30 hover:bg-white/5 hover:text-white"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto text-white/40 hover:text-white/70 transition-colors p-2 rounded-xl hover:bg-white/5"
            aria-label="Dismiss error"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

