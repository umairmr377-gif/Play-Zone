import { LucideIcon } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-[#0C0C10] border border-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Icon className="w-12 h-12 text-white/60" />
        </div>
      </div>
      <h3 className="text-2xl font-display font-black text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-white/50 mb-8 max-w-md mx-auto font-light leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

