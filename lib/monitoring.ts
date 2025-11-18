/**
 * Monitoring and error tracking setup
 * Integrates with Sentry for production error tracking
 */

/**
 * Initialize Sentry (if configured)
 * Call this in your app initialization
 */
export function initMonitoring() {
  // Only initialize in production or if SENTRY_DSN is set
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === "production") {
    // Example Sentry initialization
    // Uncomment and configure when ready
    /*
    import * as Sentry from "@sentry/nextjs";

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10% of transactions
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        return event;
      },
    });
    */
  }
}

/**
 * Capture exception to monitoring service
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context });
    console.error("Exception captured:", error, context);
  } else {
    console.error("Exception:", error, context);
  }
}

/**
 * Capture message to monitoring service
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: Record<string, any>) {
  if (process.env.SENTRY_DSN) {
    // Sentry.captureMessage(message, level, { extra: context });
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, role?: string) {
  if (process.env.SENTRY_DSN) {
    // Sentry.setUser({ id: userId, email, role });
  }
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (process.env.SENTRY_DSN) {
    // Sentry.setUser(null);
  }
}

