"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import Badge from "@/components/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { calculateTotalPrice } from "@/lib/utils";
import { Sport, Court } from "@/data/types";

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const sportId = params.sport as string;
  const courtId = params.courtId as string;
  const [sport, setSport] = useState<Sport | null>(null);
  const [court, setCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    fetchSportAndCourt();
  }, [sportId, courtId]);

  const fetchSportAndCourt = async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      
      const sportResponse = await fetch(`/api/sports/${sportId}`);

      if (sportResponse.ok) {
        const sportData = await sportResponse.json();
        setSport(sportData);
        
        // Find the court in the sport's courts
        const foundCourt = sportData.courts.find((c: Court) => c.id === courtId);
        if (foundCourt) {
          setCourt(foundCourt);
        } else {
          setError("Court not found");
        }
      } else {
        setError("Failed to load sport or court details");
      }
    } catch (error) {
      console.error("Error fetching sport/court:", error);
      setError("Failed to load sport or court details");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate && courtId) {
      fetchBookedSlots();
    }
  }, [selectedDate, courtId]);

  const fetchBookedSlots = async () => {
    if (!courtId || !selectedDate) return;
    setIsLoadingSlots(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/bookings?courtId=${courtId}&date=${selectedDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setBookedSlots(data.bookedSlots || []);
      } else {
        setError("Failed to load available time slots");
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      setError("Failed to load available time slots");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSlotToggle = (time: string) => {
    setSelectedSlots((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    );
  };

  const handleBooking = async () => {
    if (!selectedDate || selectedSlots.length === 0) {
      setError("Please select a date and at least one time slot");
      return;
    }

    if (!customerName || !customerEmail) {
      setError("Please enter your name and email");
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
          sportId,
          courtId,
          date: selectedDate,
          timeSlots: selectedSlots,
          customerName,
          customerEmail,
          totalPrice: calculateTotalPrice(selectedSlots, court?.pricePerHour || 0),
        }),
      });

      if (response.ok) {
        const booking = await response.json();
        router.push(`/confirmation?id=${booking.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-12 text-center" hover={false}>
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-text-secondary">Loading court details...</p>
        </Card>
      </div>
    );
  }

  if (!sport || !court) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-12 text-center" hover={false}>
          <h2 className="text-3xl font-display font-bold text-text-primary mb-4">
            Court Not Found
          </h2>
          <p className="text-text-secondary mb-8">
            The court you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/sports")} variant="primary">
            Back to Sports
          </Button>
        </Card>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice(selectedSlots, court.pricePerHour);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="mb-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-5xl md:text-6xl font-display font-bold text-text-primary mb-3">
          Book {court.name}
        </h1>
        <p className="text-xl text-text-secondary">{sport.name}</p>
      </div>

      {error && (
        <div className="mb-6 animate-slide-in">
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Court Info Card */}
          <Card className="p-6" hover={false}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                  {court.name}
                </h2>
                <p className="text-text-secondary">{court.location}</p>
              </div>
              <Badge variant="info" className="text-base px-4 py-2">
                ${court.pricePerHour}/hour
              </Badge>
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="p-6" hover={false}>
            <h3 className="text-xl font-display font-semibold text-text-primary mb-6">
              Your Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background-card text-text-primary"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background-card text-text-primary"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Date Selection */}
          <Card className="p-6" hover={false}>
            <h3 className="text-xl font-display font-semibold text-text-primary mb-6">
              Select Date
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlots([]);
              }}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background-card text-text-primary"
              required
            />
          </Card>

          {/* Time Slots */}
          {selectedDate && (
            <Card className="p-6" hover={false}>
              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <TimeSlotGrid
                  availableSlots={[]}
                  bookedSlots={bookedSlots}
                  selectedSlots={selectedSlots}
                  onSlotToggle={handleSlotToggle}
                />
              )}
            </Card>
          )}
        </div>

        {/* Booking Summary - Glass Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-32" hover={false}>
            <h3 className="text-2xl font-display font-bold text-text-primary mb-6">
              Booking Summary
            </h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Sport:</span>
                <span className="font-semibold text-text-primary">{sport.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Court:</span>
                <span className="font-semibold text-text-primary">{court.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Date:</span>
                <span className="font-semibold text-text-primary">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString()
                    : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Time Slots:</span>
                <span className="font-semibold text-text-primary">{selectedSlots.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Price per hour:</span>
                <span className="font-semibold text-text-primary">${court.pricePerHour}</span>
              </div>
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex justify-between text-xl font-display font-bold">
                  <span className="text-text-primary">Total:</span>
                  <span className="text-primary">${totalPrice}</span>
                </div>
              </div>
            </div>
            <Button
              fullWidth
              variant="primary"
              onClick={handleBooking}
              disabled={isLoading || selectedSlots.length === 0 || !selectedDate}
              className="shadow-smooth"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

