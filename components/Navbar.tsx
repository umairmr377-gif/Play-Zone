"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import AuthButton from "./AuthButton";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className="
        sticky top-0 z-50 mx-4 mt-4 mb-0
        rounded-2xl border border-white/10
        bg-[#0A0A0C]/80 backdrop-blur-xl
        shadow-[0_0_40px_rgba(0,0,0,0.6)]
      "
    >
      {/* Subtle luxury edge light */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-20">

          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="
                flex items-center gap-3
                text-2xl font-display font-semibold
                text-white tracking-wide
                hover:opacity-90 transition-all
              "
            >
              <div className="
                p-[2px] rounded-xl
                bg-gradient-to-br from-white/20 to-transparent
                shadow-[0_0_20px_rgba(0,0,0,0.4)]
              ">
                <Image
                  src="/branding/playzone/logo-icon-dark.svg"
                  alt="Play Zone Logo"
                  width={40}
                  height={40}
                  priority
                  className="
                    h-10 w-auto
                    transition-all duration-300
                    hover:scale-105
                  "
                />
              </div>

              <span className="font-bold text-white">Play Zone</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">

            <Link
              href="/"
              className={`
                relative px-1 py-2 text-sm font-medium uppercase tracking-wide
                transition-all duration-300
                ${
                  isActive("/")
                    ? "text-white after:w-full"
                    : "text-white/50 hover:text-white after:w-0"
                }
                after:content-[''] after:h-[2px] after:absolute after:-bottom-1
                after:left-0 after:bg-white after:transition-all after:duration-300
              `}
            >
              Home
            </Link>

            <Link
              href="/sports"
              className={`
                relative px-1 py-2 text-sm font-medium uppercase tracking-wide
                transition-all duration-300
                ${
                  isActive("/sports")
                    ? "text-white after:w-full"
                    : "text-white/50 hover:text-white after:w-0"
                }
                after:content-[''] after:h-[2px] after:absolute after:-bottom-1
                after:left-0 after:bg-white after:transition-all after:duration-300
              `}
            >
              Sports
            </Link>

            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <AuthButton />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="
                text-white/60 hover:text-white
                p-2 rounded-xl transition-all duration-300
                hover:bg-white/10
              "
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 animate-slide-in">
            <div className="flex flex-col space-y-1 pt-4 border-t border-white/10">

              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`
                  px-4 py-3 rounded-xl text-sm tracking-wide uppercase
                  transition-all duration-300
                  ${
                    isActive("/")
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                Home
              </Link>

              <Link
                href="/sports"
                onClick={() => setIsMenuOpen(false)}
                className={`
                  px-4 py-3 rounded-xl text-sm tracking-wide uppercase
                  transition-all duration-300
                  ${
                    isActive("/sports")
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                Sports
              </Link>

            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
