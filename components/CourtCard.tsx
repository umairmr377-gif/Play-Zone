import { Court } from "@/data/types";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";
import Link from "next/link";

interface CourtCardProps {
  court: Court;
  sportId: string;
  className?: string;
}

export default function CourtCard({
  court,
  sportId,
  className = "",
}: CourtCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`} hover>
      {court.image && (
        <div className="relative h-56 overflow-hidden">
          <img
            src={court.image}
            alt={court.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          {/* Price Badge Overlay */}
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="info" className="shadow-smooth text-base px-4 py-1.5">
              ${court.pricePerHour}/hour
            </Badge>
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>
      )}
      <div className="p-6 bg-background-card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-text-primary mb-2">{court.name}</h3>
            <p className="text-sm text-text-secondary">{court.location}</p>
          </div>
          {!court.image && (
            <Badge variant="info" className="ml-4">
              ${court.pricePerHour}/hour
            </Badge>
          )}
        </div>
        <Link href={`/book/${sportId}/${court.id}`}>
          <Button fullWidth variant="primary" className="shadow-smooth">
            Book Now
          </Button>
        </Link>
      </div>
    </Card>
  );
}
