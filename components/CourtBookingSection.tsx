"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sport, Court } from "@/data/types";
import TimeSlotPicker from "./TimeSlotPicker";
import BookingSummary from "./BookingSummary";
import Card from "./ui/Card";
import ErrorMessage from "./ErrorMessage";

interface CourtBookingSectionProps {
  sport: Sport;
  court: Court;
  initialSlot?: string | null;
  date?: string; // Booking date (defaults to today)
}

export default function CourtBookingSection({
  sport,
  court,
  initialSlot = null,
  date,
}: CourtBookingSectionProps) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(initialSlot);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const bookingDate = date || new Date().toISOString().split("T")[0];

  // Fetch booked slots on mount and when date changes
  useEffect(() => {
    fetchBookedSlots();
  }, [court.id, bookingDate]);

  const fetchBookedSlots = async () => {
    try {
      const response = await fetch(
        `/api/bookings?courtId=${court.id}&date=${bookingDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setBookedSlots(data.bookedSlots || []);
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setError(null);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set("slot", slot);
    window.history.pushState({}, "", url.toString());
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      setError("Please select a time slot");
      return;
    }

    // Check if slot is already booked
    if (bookedSlots.includes(selectedSlot)) {
      setError("This time slot is already booked. Please select another.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sportId: sport.id,
          courtId: court.id,
          timeSlot: selectedSlot,
          date: bookingDate,
          price: court.pricePerHour,
          userName: "", // Will be added in future phases
        }),
      });

      if (response.ok) {
        const booking = await response.json();
        // Redirect to confirmation page with booking ID
        router.push(`/booking/confirmation?bookingId=${booking.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create booking. Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Time Slot Picker */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <TimeSlotPicker
              slots={court.availableTimeSlots}
              selectedSlot={selectedSlot}
              onSelect={handleSlotSelect}
              disabledSlots={bookedSlots}
            />
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <BookingSummary
            sport={sport}
            court={court}
            slot={selectedSlot}
            onConfirm={handleConfirmBooking}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

