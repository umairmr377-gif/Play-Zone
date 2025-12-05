"use client";

import Link from "next/link";
import { sports } from "@/data/sports";
import SportCard from "@/components/SportCard";
import Button from "@/components/Button";
import MyBookingsSection from "@/components/MyBookingsSection";
import { motion } from "framer-motion";
import { Calendar, Zap, TrendingUp } from "lucide-react";

export default function Home() {
  // Get first 3 sports as featured
  const featuredSports = sports.slice(0, 3);

  // Motion background animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="py-20 md:py-28 relative overflow-hidden">
      {/* Luxury Dark Background - Subtle Ambient Light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-white/[0.015] rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-24 md:mb-32" variants={itemVariants}>
          <div className="mb-12">
            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-display font-black mb-8 text-white leading-[1.1] tracking-tight"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Your Sport,
              <br />
              <span className="relative">
                Your Time
                <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </span>
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Book your favorite sports courts with ease on Play Zone. Choose from football, cricket, paddle tennis, and more.
            </motion.p>
          </div>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/sports">
              <Button size="lg" variant="primary">
                Browse Sports
              </Button>
            </Link>
            <Link href="/sports">
              <Button size="lg" variant="outline">
                Explore Courts
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Action Blocks */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-20"
          variants={itemVariants}
        >
          <Link href="/sports">
            <motion.div
              className="bg-[#0A0A0C]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center group cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/20 hover:shadow-[0_12px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-[#0C0C10] border border-white/10 flex items-center justify-center group-hover:border-white/20 group-hover:scale-105 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                  <Calendar className="w-6 h-6 text-white/90" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2 tracking-wide">
                  Book Now
                </h3>
                <p className="text-white/50 text-sm font-light tracking-wide">
                  Reserve your court instantly
                </p>
              </div>
            </motion.div>
          </Link>

          <Link href="/sports">
            <motion.div
              className="bg-[#0A0A0C]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center group cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/20 hover:shadow-[0_12px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-[#0C0C10] border border-white/10 flex items-center justify-center group-hover:border-white/20 group-hover:scale-105 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                  <Zap className="w-6 h-6 text-white/90" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2 tracking-wide">
                  Explore Sports
                </h3>
                <p className="text-white/50 text-sm font-light tracking-wide">
                  Discover all available sports
                </p>
              </div>
            </motion.div>
          </Link>

          <Link href="/bookings/my">
            <motion.div
              className="bg-[#0A0A0C]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center group cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/20 hover:shadow-[0_12px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-[#0C0C10] border border-white/10 flex items-center justify-center group-hover:border-white/20 group-hover:scale-105 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                  <TrendingUp className="w-6 h-6 text-white/90" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2 tracking-wide">
                  My Activity
                </h3>
                <p className="text-white/50 text-sm font-light tracking-wide">
                  View your bookings & stats
                </p>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* My Bookings Section - Shows user's upcoming bookings */}
        <motion.div variants={itemVariants}>
          <MyBookingsSection />
        </motion.div>

        {/* Featured Sports */}
        <motion.div className="mb-12" variants={itemVariants}>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 text-center tracking-tight">
            Featured Sports
          </h2>
          <p className="text-white/50 text-center mb-10 text-lg font-light tracking-wide">
            Popular sports available for booking
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {featuredSports.map((sport, index) => (
            <motion.div
              key={sport.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              <SportCard sport={sport} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
