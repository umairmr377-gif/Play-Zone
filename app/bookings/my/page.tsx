"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Booking } from "@/data/types";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

export default function MyBookingsPage() {
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
        setError("Please sign in to view your bookings");
        router.push("/auth/login?redirectTo=/bookings/my");
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log("📦 Bookings data received:", data);
        console.log("📋 Bookings count:", data.bookings?.length || 0);
        setBookings(data.bookings || []);
        
        // Log if bookings array is empty
        if (!data.bookings || data.bookings.length === 0) {
          console.warn("⚠️ No bookings found in response");
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("❌ Error response:", errorData);
        setError(errorData.message || "Failed to load bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const { toPKT } = require("@/lib/utils");
    const pktDate = toPKT(dateString);
    return pktDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Karachi",
    });
  };

  const formatCurrency = (amount: number) => {
    const { formatPKR } = require("@/lib/utils");
    return formatPKR(amount);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="p-12 text-center" hover={false}>
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-white/50 font-light">Loading your bookings...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="p-8" hover={false}>
          <ErrorMessage
            message={error}
            onRetry={fetchBookings}
          />
          <div className="mt-6">
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        <Card className="p-12" hover={false}>
          <EmptyState
            icon={Calendar}
            title="No Bookings Yet"
            message="You haven't made any bookings yet. Start booking courts to see them here."
            actionLabel="Back to Home"
            onAction={() => router.push("/")}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3 tracking-tight">
            My Bookings
          </h1>
          <p className="text-white/50 font-light tracking-wide">
            View and manage all your court bookings
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-6 md:p-8" hover={true}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2 tracking-tight">
                      {booking.courtId || "Court"}
                    </h3>
                    <p className="text-sm text-white/50 font-light capitalize">
                      {booking.sportId}
                    </p>
                  </div>
                  <Badge variant="success" className="bg-[#0C0C10]/80 backdrop-blur-sm border-white/20 text-white">
                    Confirmed
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-white/70">
                    <div className="w-10 h-10 rounded-xl bg-[#0C0C10] border border-white/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white/90" />
                    </div>
                    <span className="font-medium">{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <div className="w-10 h-10 rounded-xl bg-[#0C0C10] border border-white/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white/90" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {booking.timeSlots && booking.timeSlots.length > 0 ? (
                        booking.timeSlots.map((slot) => (
                          <Badge key={slot} variant="info" className="text-xs bg-[#0C0C10]/80 backdrop-blur-sm border-white/20 text-white">
                            {slot}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-white/40 font-light">No time slots</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4 md:border-l md:border-white/10 md:pl-6">
                <div className="text-right">
                  <p className="text-sm text-white/50 font-light mb-1 tracking-wide">Total Amount</p>
                  <p className="text-3xl font-display font-black text-white numbers">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
