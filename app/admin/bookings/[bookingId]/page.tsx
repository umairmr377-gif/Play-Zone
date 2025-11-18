"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Booking } from "@/data/types";
import { getAllSports } from "@/lib/admin";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { ArrowLeft, X, CheckCircle } from "lucide-react";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBooking();
    fetchSports();
  }, [bookingId]);

  const fetchSports = async () => {
    try {
      const response = await fetch("/api/admin/sports");
      if (response.ok) {
        const data = await response.json();
        setSports(data.sports || []);
      }
    } catch (error) {
      console.error("Error fetching sports:", error);
    }
  };

  const fetchBooking = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else {
        setError("Booking not found");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      setError("Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!confirm(`Are you sure you want to mark this booking as ${status}?`)) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });

      if (response.ok) {
        fetchBooking();
      } else {
        alert("Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return <ErrorMessage message={error || "Booking not found"} onRetry={fetchBooking} />;
  }

  const sport = sports.find((s) => s.id === booking.sportId);
  const court = sport?.courts.find((c: any) => c.id === booking.courtId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600">View and manage booking information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono text-sm font-medium">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sport:</span>
                <span className="font-medium">{sport?.name || booking.sportId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Court:</span>
                <span className="font-medium">{court?.name || booking.courtId}</span>
              </div>
              {court && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{court.location}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{booking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Slots:</span>
                <div className="flex flex-wrap gap-2 justify-end">
                  {booking.timeSlots.map((slot) => (
                    <Badge key={slot} variant="success">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Price:</span>
                <span className="text-lg font-bold text-primary-600">${booking.totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created At:</span>
                <span className="font-medium">
                  {new Date(booking.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{booking.customerName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{booking.customerEmail || "N/A"}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>
            <Badge variant="default" className="mb-4 text-lg">
              {(booking as any).status || "confirmed"}
            </Badge>
            <div className="space-y-3">
              <Button
                fullWidth
                variant="outline"
                onClick={() => updateStatus("cancelled")}
                disabled={updating || (booking as any).status === "cancelled"}
                className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:border-red-600"
              >
                <X className="w-4 h-4" />
                Cancel Booking
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={() => updateStatus("completed")}
                disabled={updating || (booking as any).status === "completed"}
                className="flex items-center justify-center gap-2 text-green-600 hover:text-green-700 hover:border-green-600"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

