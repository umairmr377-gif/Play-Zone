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
    default: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-accent/10 text-accent border border-accent/20",
    warning: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
    info: "bg-primary/10 text-primary border border-primary/20",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

