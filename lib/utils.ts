/**
 * Utility functions for Play Zone
 */

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date to short string (MM/DD/YYYY)
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

/**
 * Format time slot to 12-hour format
 */
export function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Generate time slots from start to end hour
 */
export function generateTimeSlots(startHour: number = 6, endHour: number = 23): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Calculate total price for multiple time slots
 */
export function calculateTotalPrice(timeSlots: string[], pricePerHour: number): number {
  return timeSlots.length * pricePerHour;
}

/**
 * Generate a unique booking ID
 */
export function generateBookingId(): string {
  return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Merge class names (cn utility)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Silent fetch that suppresses 401 console errors
 * Useful for optional authenticated endpoints where 401 is expected
 */
export async function silentFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Temporarily override console.error to suppress 401 logs
  const originalError = console.error;
  const originalWarn = console.warn;
  
  let suppressed = false;
  
  // Override console methods to filter out 401 errors
  console.error = (...args: any[]) => {
    const message = args.join(" ");
    // Suppress 401 Unauthorized console errors
    if (message.includes("401") && message.includes("Unauthorized")) {
      suppressed = true;
      return; // Don't log this error
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(" ");
    // Suppress 401 warnings
    if (message.includes("401") && message.includes("Unauthorized")) {
      suppressed = true;
      return;
    }
    originalWarn.apply(console, args);
  };
  
  try {
    const response = await fetch(url, options);
    
    // Restore console methods
    console.error = originalError;
    console.warn = originalWarn;
    
    return response;
  } catch (error) {
    // Restore console methods on error
    console.error = originalError;
    console.warn = originalWarn;
    throw error;
  }
}

