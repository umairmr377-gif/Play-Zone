import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export default function Card({ children, className = "", hover = true, gradient = false }: CardProps) {
  return (
    <div 
      className={`
        card-glass rounded-2xl shadow-smooth overflow-hidden
        ${hover ? "hover-lift hover-glow" : ""}
        ${gradient ? "border-primary/20" : ""}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}

