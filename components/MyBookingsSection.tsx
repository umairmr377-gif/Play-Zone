"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Booking } from "@/data/types";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Calendar, Clock, MapPin, ArrowRight, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function MyBookingsSection() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Check if user is authenticated before making the request
      // This prevents unnecessary 401 console errors
      const supabase = createClient();
      let isAuthenticated = false;
      
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          isAuthenticated = !!session;
        } catch {
          // Supabase not configured or error checking session
          isAuthenticated = false;
        }
      }
      
      // Only make request if user is authenticated
      // Otherwise, silently skip (no 401 error in console)
      if (!isAuthenticated) {
        setBookings([]);
        return;
      }
      
      const response = await fetch("/api/bookings/my");
      
      if (response.status === 401) {
        // Not authenticated (session expired or invalid)
        setBookings([]);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        // Silent fail for home page - just don't show bookings
        setBookings([]);
      }
    } catch (error) {
      // Network errors or other exceptions
      console.error("Error fetching bookings:", error);
      // Silent fail for home page
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const { formatDateRelativePKT, formatPKR } = require("@/lib/utils");
    // Use the utility function that handles PKT timezone correctly
    return formatDateRelativePKT(dateString);
  };

  const formatCurrency = (amount: number) => {
    const { formatPKR } = require("@/lib/utils");
    return formatPKR(amount);
  };

  // Don't show section if not authenticated or loading
  if (loading) {
    return (
      <div className="mb-16">
        <div className="mb-8">
          <h2 className="text-4xl font-display font-black text-white mb-3 text-center tracking-tight">
            My Bookings
          </h2>
          <p className="text-white/50 text-center mb-8 font-light tracking-wide">
            Your upcoming and past bookings
          </p>
        </div>
        <Card className="p-12 text-center" hover={false}>
          <LoadingSpinner size="md" className="mb-4" />
          <p className="text-white/50 font-light">Loading your bookings...</p>
        </Card>
      </div>
    );
  }

  // Don't show section if no bookings or not authenticated
  if (bookings.length === 0) {
    return null;
  }

  // Get upcoming bookings (today or future)
  const today = new Date().toISOString().split("T")[0];
  const upcomingBookings = bookings.filter(
    (booking) => booking.date >= today
  );
  const pastBookings = bookings.filter((booking) => booking.date < today);

  // Show only upcoming bookings on home page (limit to 3)
  const displayBookings = upcomingBookings.slice(0, 3);

  if (displayBookings.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display font-black text-white mb-3 tracking-tight">
            My Bookings
          </h2>
          <p className="text-white/50 font-light tracking-wide">
            Your upcoming bookings
          </p>
        </div>
        <Link href="/bookings/my">
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayBookings.map((booking) => (
          <Card key={booking.id} className="p-6" hover={true}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-white mb-2 tracking-tight">
                  {booking.courtId}
                </h3>
                <p className="text-sm text-white/50 font-light capitalize">
                  {booking.sportId}
                </p>
              </div>
              <Badge variant="success" className="text-xs bg-[#0C0C10]/80 backdrop-blur-sm border-white/20 text-white">
                Confirmed
              </Badge>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 text-sm text-white/70">
                <div className="w-9 h-9 rounded-xl bg-[#0C0C10] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-white/90" />
                </div>
                <span className="font-medium">{formatDate(booking.date)}</span>
              </div>
              
              <div className="flex items-start gap-3 text-sm text-white/70">
                <div className="w-9 h-9 rounded-xl bg-[#0C0C10] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white/90" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {booking.timeSlots.map((slot) => (
                    <Badge key={slot} variant="info" className="text-xs bg-[#0C0C10]/80 backdrop-blur-sm border-white/20 text-white">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/40">
                <div className="w-9 h-9 rounded-xl bg-[#0C0C10] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 h-3 text-white/60" />
                </div>
                <span className="truncate font-light">ID: {booking.id.slice(0, 8)}...</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-5 mt-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 font-light mb-1 tracking-wide">Total</p>
                <p className="text-xl font-display font-black text-white numbers">
                  {formatCurrency(booking.totalPrice)}
                </p>
              </div>
              <Link href={`/confirmation?id=${booking.id}`}>
                <Button variant="outline" size="sm">
                  View
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {upcomingBookings.length > 3 && (
        <div className="mt-8 text-center">
          <Link href="/bookings/my">
            <Button variant="outline">
              View All {upcomingBookings.length} Bookings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
