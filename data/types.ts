/**
 * TypeScript interfaces for Play Zone
 */

export interface TimeSlot {
  start: string; // Format: "HH:MM" (24-hour format, e.g., "06:00", "14:30")
  end: string;   // Format: "HH:MM"
  isAvailable: boolean;
}

export interface Court {
  id: string;
  name: string;
  pricePerHour: number;
  location: string;
  image?: string;
  availableTimeSlots: string[]; // Array of time strings in "HH:MM" format (6 AM to 11 PM)
}

export interface Sport {
  id: string;
  name: string;
  description: string;
  image: string; // Path to image in /public/images/
  courts: Court[];
}

export interface Booking {
  id: string;
  sportId: string;
  courtId: string;
  date: string; // Format: "YYYY-MM-DD"
  timeSlots: string[]; // Array of time strings in "HH:MM" format
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  createdAt: string; // ISO 8601 format
  status?: "confirmed" | "cancelled" | "completed"; // Optional status field
}

