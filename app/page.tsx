import Link from "next/link";
import { sports } from "@/data/sports";
import SportCard from "@/components/SportCard";
import Button from "@/components/Button";

export default function Home() {
  // Get first 3 sports as featured
  const featuredSports = sports.slice(0, 3);

  return (
    <div className="py-16 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-display font-bold text-primary mb-6">
            Your Sport, Your Time
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-3xl mx-auto leading-relaxed">
            Book your favorite sports courts with ease on Play Zone. Choose from football, cricket, paddle tennis, and more.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/sports">
            <Button size="lg" variant="primary" className="shadow-glow">
              Browse Sports
            </Button>
          </Link>
          <Link href="/sports">
            <Button size="lg" variant="outline">
              Explore Courts
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Sports */}
      <div className="mb-12">
        <h2 className="text-4xl font-display font-bold text-text-primary mb-3 text-center">
          Featured Sports
        </h2>
        <p className="text-text-secondary text-center mb-8">
          Popular sports available for booking
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredSports.map((sport, index) => (
          <div key={sport.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <SportCard sport={sport} />
          </div>
        ))}
      </div>
    </div>
  );
}
