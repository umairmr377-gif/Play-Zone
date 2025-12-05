"use client";

import { Sport } from "@/data/types";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, Flame } from "lucide-react";
import { useState } from "react";

interface SportCardProps {
  sport: Sport;
  className?: string;
  showTag?: "trending" | "new" | "hot" | null;
}

export default function SportCard({ sport, className = "", showTag = null }: SportCardProps) {
  const minPrice = Math.min(...sport.courts.map((court) => court.pricePerHour));
  const [isHovered, setIsHovered] = useState(false);

  // Determine tag based on sport index or props
  // Note: sport.id is a string (UUID), so we can't compare it directly
  // For now, use showTag prop or null (trending/hot logic should be handled by parent)
  const tag = showTag || null;

  const tagConfig = {
    trending: { icon: TrendingUp, text: "Trending", color: "bg-[#0C0C10] border-white/20", glow: "shadow-[0_4px_16px_rgba(0,0,0,0.4)]" },
    new: { icon: Sparkles, text: "New", color: "bg-[#0C0C10] border-white/20", glow: "shadow-[0_4px_16px_rgba(0,0,0,0.4)]" },
    hot: { icon: Flame, text: "Hot", color: "bg-[#0C0C10] border-white/20", glow: "shadow-[0_4px_16px_rgba(0,0,0,0.4)]" },
  };

  // Get the current tag config and icon component
  const currentTag = tag ? tagConfig[tag] : null;
  const TagIcon = currentTag?.icon;

  return (
    <Card className={`overflow-hidden group ${className}`} hover gradient>
      <div
        className="relative h-56 md:h-64 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Luxury Edge Stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 z-10" />
        
        <motion.img
          src={sport.image}
          alt={sport.name}
          className="w-full h-full object-cover"
          animate={isHovered ? { scale: 1.08 } : { scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        
        {/* Dark Luxury Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C]/95 via-[#0A0A0C]/60 to-transparent" />
        
        {/* Animated Tag */}
        {tag && currentTag && (
          <motion.div
            className={`absolute top-4 left-4 z-20 ${currentTag.color} border ${currentTag.glow} px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white text-xs font-semibold tracking-wide backdrop-blur-sm`}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
          >
            {TagIcon && <TagIcon className="w-3 h-3" />}
            <span>{currentTag.text}</span>
          </motion.div>
        )}
        
        <div className="absolute top-4 right-4 z-20">
          <Badge variant="success" className="bg-[#0C0C10]/80 backdrop-blur-sm border-white/20">
            {sport.courts.length} {sport.courts.length === 1 ? "Court" : "Courts"}
          </Badge>
        </div>
      </div>
      <div className="p-6 bg-[#0A0A0C]/80 backdrop-blur-xl border-t border-white/10 relative">
        <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-white/90 transition-colors duration-300 tracking-tight">
          {sport.name}
        </h3>
        <p className="text-white/50 mb-4 line-clamp-2 text-sm font-light leading-relaxed">{sport.description}</p>
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm font-medium text-white/70">
            From <span className="text-white font-semibold numbers">${minPrice}</span>/hour
          </div>
          <Link href={`/sports/${sport.id}`}>
            <Button size="sm" variant="outline">
              View Courts
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
