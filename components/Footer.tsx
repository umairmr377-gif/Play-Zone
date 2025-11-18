export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-card border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-text-secondary">
            © {currentYear} Play Zone. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

