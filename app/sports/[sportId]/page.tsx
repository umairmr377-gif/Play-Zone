import { notFound } from "next/navigation";
import Link from "next/link";
import { getSportById } from "@/lib/sports";
import CourtCard from "@/components/CourtCard";
import Badge from "@/components/Badge";
import { ArrowLeft } from "lucide-react";

interface SportPageProps {
  params: Promise<{
    sportId: string;
  }>;
}

export default async function SportPage({ params }: SportPageProps) {
  const { sportId } = await params;
  const sport = await getSportById(sportId);

  if (!sport) {
    notFound();
  }

  return (
    <div className="py-16 animate-fade-in">
      {/* Back Button */}
      <Link
        href="/sports"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Sports</span>
      </Link>

      {/* Sport Banner with Gradient Overlay */}
      <div className="relative mb-12 rounded-2xl overflow-hidden shadow-glow">
        <div className="relative h-96 md:h-[500px]">
          <img
            src={sport.image}
            alt={sport.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
              {sport.name}
            </h1>
            <p className="text-xl text-white/90 mb-6 max-w-2xl">
              {sport.description}
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="success" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {sport.courts.length} {sport.courts.length === 1 ? "Court Available" : "Courts Available"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Courts List */}
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-text-primary mb-2">
          Available Courts
        </h2>
        <p className="text-text-secondary">Select a court to book</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sport.courts.map((court, index) => (
          <div key={court.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
            <CourtCard
              court={court}
              sportId={sport.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

