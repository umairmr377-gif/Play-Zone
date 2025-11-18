"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error
    captureException(error, {
      digest: error.digest,
      component: "GlobalErrorBoundary",
    });
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{
            textAlign: "center",
            maxWidth: "500px",
          }}>
            <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#666", marginBottom: "24px" }}>
              A critical error occurred. Please refresh the page or contact support.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                backgroundColor: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

