"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  tilt?: boolean;
}

export default function Card({ 
  children, 
  className = "", 
  hover = true, 
  gradient = false,
  tilt = false 
}: CardProps) {
  return (
    <div 
      className={`
        bg-[#0A0A0C]/80 backdrop-blur-xl rounded-2xl overflow-hidden
        border border-white/10
        ${hover ? "card-depth-hover" : "card-depth"}
        ${tilt ? "hover-tilt" : ""}
        ${gradient ? "border-white/10" : ""}
        transition-all duration-300
        relative group
        ${className}
      `}
    >
      {/* Luxury top highlight gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Hover highlight edge */}
      {hover && (
        <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/20 transition-all duration-300 pointer-events-none" />
      )}
    </div>
  );
}

