"use client";

import { useState, useEffect } from "react";
import SportCard from "@/components/SportCard";
import ErrorMessage from "@/components/ErrorMessage";
import { motion } from "framer-motion";
import { Sport } from "@/data/types";

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch("/api/sports");
        if (!response.ok) {
          throw new Error("Failed to fetch sports");
        }
        const data = await response.json();
        setSports(data.sports || []);
      } catch (err) {
        setError("Failed to load sports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchSports();
  }, []);

  // Filter logic (can be expanded)
  const filteredSports = filter === "all" 
    ? sports 
    : sports.filter((sport) => sport.name.toLowerCase().includes(filter.toLowerCase()));

  // Categorize sports for horizontal scroll
  const trendingSports = sports.slice(0, 3);
  const allSports = sports;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-pulse text-text-secondary">Loading sports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <ErrorMessage message={error} showRetry={true} />
      </div>
    );
  }

  return (
    <div className="py-20 md:py-24 relative">
      {/* Header */}
      <motion.div
        className="mb-16 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-6 text-white tracking-tight">
          All Sports
        </h1>
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-light tracking-wide">
          Browse and book from our wide selection of sports courts
        </p>
      </motion.div>

      {/* Filter Chips */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 mb-16"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {["all", "trending", "popular"].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 capitalize tracking-wide ${
              filter === filterOption
                ? "bg-[#0C0C10] text-white border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "bg-[#0A0A0C]/60 backdrop-blur-xl text-white/60 border border-white/10 hover:text-white hover:border-white/20 hover:bg-[#0A0A0C]/80 shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            }`}
          >
            {filterOption}
          </button>
        ))}
      </motion.div>

      {/* Trending Section - Horizontal Scroll */}
      {filter === "all" && (
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-black text-white flex items-center gap-3 tracking-tight">
              <span className="w-1 h-10 bg-white/20 rounded-full" />
              Trending Now
            </h2>
            <span className="text-sm text-white/40 font-light tracking-wide">Swipe →</span>
          </div>
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-6 min-w-max">
              {trendingSports.map((sport, index) => (
                <motion.div
                  key={sport.id}
                  className="w-80 flex-shrink-0"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.01, y: -2 }}
                >
                  <SportCard sport={sport} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* All Sports Grid */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: filter === "all" ? 0.5 : 0.3, duration: 0.6 }}
      >
        {filter !== "all" && (
          <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-8 flex items-center gap-3 tracking-tight">
            <span className="w-1 h-10 bg-white/20 rounded-full" />
            {filter.charAt(0).toUpperCase() + filter.slice(1)} Sports
          </h2>
        )}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredSports.map((sport) => (
            <motion.div key={sport.id} variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }}>
              <SportCard sport={sport} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
