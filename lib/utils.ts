/**
 * Utility functions for Play Zone
 */

/**
 * Convert date to Pakistan Standard Time (PKT - UTC+5)
 * 
 * Note: JavaScript Date objects are always stored in UTC internally.
 * This function returns a Date object that, when formatted with timeZone: 'Asia/Karachi',
 * will display the correct PKT time. The Date object itself remains in UTC.
 * 
 * For proper PKT formatting, use formatDatePKT(), formatTimePKT(), etc. which
 * use the timeZone parameter in toLocaleString().
 */
export function toPKT(date: string | Date): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  // getTime() already returns UTC milliseconds since epoch
  // We don't need to adjust for local timezone - the Date object is already in UTC
  // Just return it as-is; formatting functions will handle PKT conversion
  return dateObj;
}

/**
 * Format currency amount in PKR
 * Returns format: "PKR 1,200"
 */
export function formatPKR(amount: number): string {
  // Format number with thousand separators
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `PKR ${formattedNumber}`;
}

/**
 * Format currency amount in PKR (alias for formatPKR)
 * @deprecated Use formatPKR instead
 */
export function formatCurrency(amount: number): string {
  return formatPKR(amount);
}

/**
 * Format date to readable string in PKT
 */
export function formatDate(date: string | Date): string {
  const pktDate = toPKT(date);
  return pktDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Karachi",
  });
}

/**
 * Format date to short string (MM/DD/YYYY) in PKT
 */
export function formatDateShort(date: string | Date): string {
  const pktDate = toPKT(date);
  return pktDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });
}

/**
 * Format time slot to 12-hour format with PKT
 */
export function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm} PKT`;
}

/**
 * Format time with PKT timezone
 */
export function formatTimePKT(date: string | Date): string {
  const pktDate = toPKT(date);
  return pktDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  }) + " PKT";
}

/**
 * Format datetime with PKT timezone
 */
export function formatDateTimePKT(date: string | Date): string {
  const pktDate = toPKT(date);
  return pktDate.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  }) + " PKT";
}

/**
 * Format date relatively (Today, Tomorrow) in PKT timezone
 * Falls back to formatted date string if not today or tomorrow
 */
export function formatDateRelativePKT(dateString: string): string {
  const date = toPKT(dateString);
  
  // Get today's date in PKT (YYYY-MM-DD format)
  const todayPKT = getTodayDate();
  
  // Get tomorrow's date in PKT by parsing today's PKT date string and adding 1 day
  // This ensures date arithmetic happens on the PKT date, not local timezone
  const [year, month, day] = todayPKT.split("-").map(Number);
  // Create a date object from the PKT date components
  // Use UTC to avoid local timezone interference, then format with PKT timezone
  const todayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  // Add 1 day (24 hours)
  const tomorrowUTC = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000);
  // Format in PKT timezone to get tomorrow's date string
  const tomorrowPKT = tomorrowUTC.toLocaleDateString("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  // Get the input date in PKT (YYYY-MM-DD format)
  const inputDatePKT = date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  // Compare date strings in PKT
  if (inputDatePKT === todayPKT) {
    return "Today";
  } else if (inputDatePKT === tomorrowPKT) {
    return "Tomorrow";
  }
  
  // Fall back to formatted date
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Karachi",
  });
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
 * Check if a date is in the past (using PKT timezone)
 */
export function isPastDate(date: string): boolean {
  // Get today's date in PKT (YYYY-MM-DD format)
  const todayPKT = getTodayDate();
  // Compare date strings directly (YYYY-MM-DD format)
  return date < todayPKT;
}

/**
 * Get today's date in YYYY-MM-DD format (PKT)
 */
export function getTodayDate(): string {
  const now = new Date();
  // Format the date in PKT timezone
  const pktDateString = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // Returns format: YYYY-MM-DD
  return pktDateString;
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

