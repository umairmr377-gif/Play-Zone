import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  ...props
}: ButtonProps) {
  const baseStyles = "font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background active:scale-95";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark shadow-smooth hover:shadow-glow focus:ring-primary",
    secondary: "bg-background-card text-text-primary hover:bg-background-card/80 shadow-smooth focus:ring-primary",
    ghost: "bg-transparent text-text-primary hover:bg-background-card focus:ring-primary",
    outline: "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

