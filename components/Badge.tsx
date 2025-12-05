interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variants = {
    default: "bg-[#0C0C10]/80 backdrop-blur-sm text-white/80 border border-white/20",
    success: "bg-[#0C0C10]/80 backdrop-blur-sm text-white/80 border border-white/20",
    warning: "bg-[#0C0C10]/80 backdrop-blur-sm text-white/80 border border-white/20",
    danger: "bg-[#0C0C10]/80 backdrop-blur-sm text-white/80 border border-white/20",
    info: "bg-[#0C0C10]/80 backdrop-blur-sm text-white/80 border border-white/20",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

