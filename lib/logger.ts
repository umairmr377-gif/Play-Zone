/**
 * Structured logging utility
 * Can be extended to forward logs to external services (Sentry, Logflare, etc.)
 */

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // Console output (for development and Vercel logs)
    const consoleMethod =
      level === LogLevel.ERROR
        ? console.error
        : level === LogLevel.WARN
        ? console.warn
        : level === LogLevel.DEBUG
        ? console.debug
        : console.log;

    consoleMethod(JSON.stringify(logEntry));

    // TODO: Forward to external logging service
    // Example: Sentry, Logflare, Datadog, etc.
    this.forwardToExternalService(logEntry);
  }

  private forwardToExternalService(logEntry: any) {
    // Example: Send to Sentry for errors
    if (logEntry.level === LogLevel.ERROR && typeof window === "undefined") {
      // Server-side only
      // Sentry.captureException(new Error(logEntry.message), {
      //   extra: logEntry,
      // });
    }

    // Example: Send to Logflare
    // if (process.env.LOGFLARE_API_KEY) {
    //   fetch("https://api.logflare.app/logs", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "X-API-Key": process.env.LOGFLARE_API_KEY,
    //     },
    //     body: JSON.stringify(logEntry),
    //   }).catch(console.error);
    // }
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : String(error),
    };
    this.log(LogLevel.ERROR, message, errorContext);
  }

  // Specialized loggers for common events
  bookingCreated(bookingId: string, userId: string, context?: LogContext) {
    this.info("Booking created", {
      event: "booking.created",
      bookingId,
      userId,
      ...context,
    });
  }

  bookingFailed(bookingId: string | null, userId: string, error: Error, context?: LogContext) {
    this.error("Booking creation failed", error, {
      event: "booking.failed",
      bookingId,
      userId,
      ...context,
    });
  }

  adminMutation(action: string, adminId: string, resource: string, resourceId: string, context?: LogContext) {
    this.info("Admin mutation", {
      event: "admin.mutation",
      action,
      adminId,
      resource,
      resourceId,
      ...context,
    });
  }

  authEvent(event: string, userId: string, context?: LogContext) {
    this.info("Auth event", {
      event: `auth.${event}`,
      userId,
      ...context,
    });
  }
}

export const logger = new Logger();

