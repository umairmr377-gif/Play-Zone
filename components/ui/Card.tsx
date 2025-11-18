import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl shadow-md hover:shadow-lg transition-shadow bg-white ${className}`}>
      {children}
    </div>
  );
}

