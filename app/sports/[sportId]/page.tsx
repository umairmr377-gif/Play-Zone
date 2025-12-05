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
    <div className="py-20 md:py-24 animate-fade-in">
      {/* Back Button */}
      <Link
        href="/sports"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-10 transition-colors group tracking-wide"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium text-sm">Back to Sports</span>
      </Link>

      {/* Sport Banner with Dark Luxury Overlay */}
      <div className="relative mb-16 rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="relative h-96 md:h-[500px]">
          <img
            src={sport.image}
            alt={sport.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0A0A0C]/85" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-white mb-4 tracking-tight">
              {sport.name}
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-6 max-w-2xl font-light leading-relaxed">
              {sport.description}
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="success" className="bg-[#0C0C10]/80 backdrop-blur-sm text-white border-white/20">
                {sport.courts.length} {sport.courts.length === 1 ? "Court Available" : "Courts Available"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Courts List */}
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-3 tracking-tight">
          Available Courts
        </h2>
        <p className="text-white/50 font-light tracking-wide">Select a court to book</p>
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

