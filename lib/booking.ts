/**
 * Booking-related utilities and types
 */

import { generateBookingId } from "./utils";

export interface Booking {
  id: string;
  sportId: string;
  courtId: string;
  date: string;
  timeSlots: string[];
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  createdAt: string;
}

export interface BookingConflict {
  booking: Booking;
  conflictingSlots: string[];
}

/**
 * Check for booking conflicts
 */
export function checkBookingConflicts(
  existingBookings: Booking[],
  courtId: string,
  date: string,
  timeSlots: string[]
): BookingConflict[] {
  const conflicts: BookingConflict[] = [];

  existingBookings.forEach((booking) => {
    if (booking.courtId === courtId && booking.date === date) {
      const conflictingSlots = booking.timeSlots.filter((slot) =>
        timeSlots.includes(slot)
      );

      if (conflictingSlots.length > 0) {
        conflicts.push({
          booking,
          conflictingSlots,
        });
      }
    }
  });

  return conflicts;
}

/**
 * Get booked time slots for a specific court and date
 */
export function getBookedSlots(
  bookings: Booking[],
  courtId: string,
  date: string
): string[] {
  return bookings
    .filter((booking) => booking.courtId === courtId && booking.date === date)
    .flatMap((booking) => booking.timeSlots);
}

/**
 * Create a new booking object
 */
export function createBooking(
  sportId: string,
  courtId: string,
  date: string,
  timeSlots: string[],
  customerName: string,
  customerEmail: string,
  totalPrice: number
): Booking {
  return {
    id: generateBookingId(),
    sportId,
    courtId,
    date,
    timeSlots,
    customerName,
    customerEmail,
    totalPrice,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate booking data
 */
export function validateBooking(booking: Partial<Booking>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!booking.sportId) errors.push("Sport ID is required");
  if (!booking.courtId) errors.push("Court ID is required");
  if (!booking.date) errors.push("Date is required");
  if (!booking.timeSlots || booking.timeSlots.length === 0) {
    errors.push("At least one time slot is required");
  }
  if (!booking.customerName || booking.customerName.trim().length === 0) {
    errors.push("Customer name is required");
  }
  if (!booking.customerEmail) {
    errors.push("Customer email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.customerEmail)) {
    errors.push("Invalid email format");
  }
  if (!booking.totalPrice || booking.totalPrice <= 0) {
    errors.push("Total price must be greater than 0");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Filter bookings by sport
 */
export function filterBookingsBySport(
  bookings: Booking[],
  sportId: string
): Booking[] {
  if (sportId === "all") return bookings;
  return bookings.filter((booking) => booking.sportId === sportId);
}

/**
 * Calculate total revenue from bookings
 */
export function calculateTotalRevenue(bookings: Booking[]): number {
  return bookings.reduce((total, booking) => total + booking.totalPrice, 0);
}

/**
 * Get unique customers count
 */
export function getUniqueCustomersCount(bookings: Booking[]): number {
  const uniqueEmails = new Set(bookings.map((booking) => booking.customerEmail));
  return uniqueEmails.size;
}

