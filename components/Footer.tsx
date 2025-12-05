import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0C]/80 backdrop-blur-xl border-t border-white/10 mt-auto relative">
      {/* Luxury top highlight edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand Section */}
          <div>
            <h3 className="text-lg font-display font-bold text-white mb-4 tracking-tight">Play Zone</h3>
            <p className="text-white/50 text-sm font-light leading-relaxed max-w-xs">
              Your premium destination for booking sports courts. Book your favorite courts with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-display font-semibold text-white mb-4 tracking-wide uppercase">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/sports" className="text-white/50 hover:text-white text-sm font-light transition-colors duration-300 tracking-wide">
                  Browse Sports
                </Link>
              </li>
              <li>
                <Link href="/bookings/my" className="text-white/50 hover:text-white text-sm font-light transition-colors duration-300 tracking-wide">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/" className="text-white/50 hover:text-white text-sm font-light transition-colors duration-300 tracking-wide">
                  Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Info */}
          <div>
            <h4 className="text-sm font-display font-semibold text-white mb-4 tracking-wide uppercase">Support</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-white/50 text-sm font-light tracking-wide">24/7 Booking Available</span>
              </li>
              <li>
                <span className="text-white/50 text-sm font-light tracking-wide">Instant Confirmation</span>
              </li>
              <li>
                <span className="text-white/50 text-sm font-light tracking-wide">Premium Experience</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm font-light tracking-wide">
              © {currentYear} Play Zone. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-white/40 hover:text-white/60 text-xs font-light transition-colors duration-300 tracking-wide">
                Privacy
              </Link>
              <Link href="/" className="text-white/40 hover:text-white/60 text-xs font-light transition-colors duration-300 tracking-wide">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

