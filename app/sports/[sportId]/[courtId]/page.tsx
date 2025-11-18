import { notFound } from "next/navigation";
import Link from "next/link";
import { getSportById } from "@/lib/sports";
import { getCourtById } from "@/lib/courts";
import CourtBookingSection from "@/components/CourtBookingSection";
import SupabaseWarning from "@/components/SupabaseWarning";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { isSupabaseConfigured } from "@/lib/safe-supabase";

interface CourtPageProps {
  params: Promise<{
    sportId: string;
    courtId: string;
  }>;
  searchParams: Promise<{
    slot?: string;
  }>;
}

export default async function CourtPage({ params, searchParams }: CourtPageProps) {
  const { sportId, courtId } = await params;
  const { slot } = await searchParams;
  
  const sport = await getSportById(sportId);
  const court = await getCourtById(sportId, courtId);

  if (!sport || !court) {
    notFound();
  }

  const supabaseConfigured = isSupabaseConfigured();

  return (
    <div className="py-12">
      {/* Back Button */}
      <Link
        href={`/sports/${sportId}`}
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
      >
        ← Back to {sport.name}
      </Link>

      {/* Supabase Warning */}
      {!supabaseConfigured && <SupabaseWarning />}

      {/* Court Information */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {court.image && (
              <div className="md:w-1/3">
                <img
                  src={court.image}
                  alt={court.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {court.name}
                  </h1>
                  <p className="text-gray-600 mb-4">{court.location}</p>
                </div>
                <Badge variant="info" className="text-lg px-4 py-2">
                  ${court.pricePerHour}/hour
                </Badge>
              </div>
              <p className="text-gray-700">
                <strong>Sport:</strong> {sport.name}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Booking Section */}
      <CourtBookingSection
        sport={sport}
        court={court}
        initialSlot={slot || null}
        date={new Date().toISOString().split("T")[0]}
      />
    </div>
  );
}

