"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { CheckCircle2 } from "lucide-react";
import { Booking, Sport, Court } from "@/data/types";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [sport, setSport] = useState<Sport | null>(null);
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (bookingId) {
      fetchBooking(bookingId);
    } else {
      setError("No booking ID provided");
      setLoading(false);
    }
  }, [searchParams]);

  const fetchBooking = async (bookingId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
        
        // Fetch sport and court details
        if (data.sportId && data.courtId) {
          const sportResponse = await fetch(`/api/sports/${data.sportId}`);
          if (sportResponse.ok) {
            const sportData = await sportResponse.json();
            setSport(sportData);
            
            // Find court in sport data
            const foundCourt = sportData.courts?.find((c: Court) => c.id === data.courtId);
            if (foundCourt) {
              setCourt(foundCourt);
            }
          }
        }
      } else if (response.status === 404) {
        setError("Booking not found. Please check your booking ID.");
      } else {
        setError("Failed to load booking details.");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      setError("Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <Card className="p-8 text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </Card>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-12">
        <Card className="p-8 text-center">
          <ErrorMessage
            message={error || "Booking not found"}
            onRetry={() => router.push("/sports")}
          />
          <div className="mt-4">
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!sport || !court || !booking) {
    if (!loading) {
      return (
        <div className="py-12">
          <Card className="p-8 text-center">
            <ErrorMessage
              message="Sport or court information not found"
              onRetry={() => router.push("/sports")}
            />
            <div className="mt-4">
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </Card>
        </div>
      );
    }
    return null; // Still loading
  }

  const bookingDate = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="py-12">
      <Card className="p-8 max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your booking has been successfully confirmed.
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Booking Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-mono text-sm font-medium">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sport:</span>
              <span className="font-medium">{sport.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Court:</span>
              <span className="font-medium">{court.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium text-right max-w-[60%]">{court.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{bookingDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Slot:</span>
              <div className="flex flex-wrap gap-2 justify-end">
                {booking.timeSlots.map((slot) => (
                  <Badge key={slot} variant="success">
                    {slot}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price per hour:</span>
              <span className="font-medium">${court.pricePerHour}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary-600">${booking.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/sports">
            <Button variant="outline">Book Another Court</Button>
          </Link>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
