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
      className={`card-glass border-2 border-danger/30 rounded-2xl p-6 bg-danger/10 ${className} animate-slide-in`}
    >
      <div className="flex items-start">
        <AlertCircle className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-display font-semibold text-danger mb-1">{title}</h3>
          <p className="text-sm text-text-primary mb-4">{message}</p>
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
                className="border-danger/30 text-danger hover:bg-danger/10"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto text-danger/60 hover:text-danger transition-colors p-1 rounded-lg hover:bg-danger/10"
            aria-label="Dismiss error"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

