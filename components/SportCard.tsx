import { Sport } from "@/data/types";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";
import Link from "next/link";

interface SportCardProps {
  sport: Sport;
  className?: string;
}

export default function SportCard({ sport, className = "" }: SportCardProps) {
  const minPrice = Math.min(...sport.courts.map((court) => court.pricePerHour));

  return (
    <Card className={`overflow-hidden ${className}`} hover gradient>
      <div className="relative h-56 md:h-64 overflow-hidden">
        {/* Left Neon Stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary z-10" />
        
        <img
          src={sport.image}
          alt={sport.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        <div className="absolute top-4 right-4 z-20">
          <Badge variant="success" className="shadow-smooth">
            {sport.courts.length} {sport.courts.length === 1 ? "Court" : "Courts"}
          </Badge>
        </div>
      </div>
      <div className="p-6 bg-background-card">
        <h3 className="text-2xl font-display font-bold text-text-primary mb-2">{sport.name}</h3>
        <p className="text-text-secondary mb-4 line-clamp-2 text-sm">{sport.description}</p>
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm font-medium text-text-primary">
            From <span className="text-primary font-semibold">${minPrice}</span>/hour
          </div>
          <Link href={`/sports/${sport.id}`}>
            <Button size="sm" variant="primary" className="shadow-smooth">
              View Courts
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
