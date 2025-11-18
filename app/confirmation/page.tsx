"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Printer, ArrowLeft } from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { Booking } from "@/lib/booking";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingId = searchParams.get("id") || searchParams.get("bookingId");
    if (bookingId) {
      fetchBooking(bookingId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <EmptyState
            icon={CheckCircle2}
            title="Booking Not Found"
            message="We couldn't find your booking. Please check your booking ID or try again."
            actionLabel="Browse Sports"
            onAction={() => router.push("/sports")}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="p-8">
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
            Your booking has been successfully confirmed on Play Zone.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Booking Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-medium">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sport:</span>
              <span className="font-medium capitalize">{booking.sportId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Court:</span>
              <span className="font-medium">{booking.courtId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(booking.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Slots:</span>
              <div className="flex flex-wrap gap-2">
                {booking.timeSlots.map((slot) => (
                  <Badge key={slot} variant="success">
                    {slot}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{booking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{booking.customerEmail}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary-600">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> A confirmation email has been sent to{" "}
            {booking.customerEmail}. Please arrive 10 minutes before your
            scheduled time.
          </p>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button onClick={() => router.push("/sports")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Book Another Court
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Confirmation
          </Button>
        </div>
      </Card>
    </div>
  );
}

