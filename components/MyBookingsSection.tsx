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
      
      const response = await fetch("/api/bookings/my");
      
      if (response.status === 401) {
        // Not authenticated - don't show error, just show empty
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
      console.error("Error fetching bookings:", error);
      // Silent fail for home page
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Don't show section if not authenticated or loading
  if (loading) {
    return (
      <div className="mb-16">
        <div className="mb-8">
          <h2 className="text-4xl font-display font-bold text-text-primary mb-3 text-center">
            My Bookings
          </h2>
          <p className="text-text-secondary text-center mb-8">
            Your upcoming and past bookings
          </p>
        </div>
        <Card className="p-12 text-center" hover={false}>
          <LoadingSpinner size="md" className="mb-4" />
          <p className="text-text-secondary">Loading your bookings...</p>
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display font-bold text-text-primary mb-3">
            My Bookings
          </h2>
          <p className="text-text-secondary">
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
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-text-primary mb-1">
                  {booking.courtId}
                </h3>
                <p className="text-sm text-text-secondary capitalize">
                  {booking.sportId}
                </p>
              </div>
              <Badge variant="success" className="text-xs">
                Confirmed
              </Badge>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{formatDate(booking.date)}</span>
              </div>
              
              <div className="flex items-start gap-2 text-sm text-text-secondary">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {booking.timeSlots.map((slot) => (
                    <Badge key={slot} variant="info" className="text-xs">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">ID: {booking.id.slice(0, 8)}...</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary">Total</p>
                <p className="text-lg font-bold text-text-primary">
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
        <div className="mt-6 text-center">
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
