"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Trophy } from "lucide-react";
import AuthButton from "./AuthButton";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="card-glass sticky top-0 z-50 shadow-smooth rounded-xl mx-4 mt-4 mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo / App Name */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-2xl font-display font-bold text-primary hover:text-primary-light transition-colors duration-300"
            >
              <Trophy className="w-7 h-7 text-primary" />
              <span>Play Zone</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-300 hover:bg-background-card"
            >
              Home
            </Link>
            <Link
              href="/sports"
              className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-300 hover:bg-background-card"
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
              className="text-text-secondary hover:text-text-primary p-2 rounded-xl transition-colors duration-300 hover:bg-background-card"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Slide Over */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 animate-slide-in">
            <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
              <Link
                href="/"
                className="text-text-secondary hover:text-text-primary px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-300 hover:bg-background-card"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/sports"
                className="text-text-secondary hover:text-text-primary px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-300 hover:bg-background-card"
                onClick={() => setIsMenuOpen(false)}
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

