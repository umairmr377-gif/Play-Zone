import { getAllSports } from "@/lib/sports";
import SportCard from "@/components/SportCard";
import ErrorMessage from "@/components/ErrorMessage";

export default async function SportsPage() {
  try {
    const sports = await getAllSports();

    return (
      <div className="py-16 animate-fade-in">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-text-primary mb-4">
            All Sports
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Browse and book from our wide selection of sports courts
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sports.map((sport, index) => (
            <div key={sport.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <SportCard sport={sport} />
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="py-16">
        <ErrorMessage
          message="Failed to load sports. Please try again later."
          showRetry={true}
        />
      </div>
    );
  }
}
