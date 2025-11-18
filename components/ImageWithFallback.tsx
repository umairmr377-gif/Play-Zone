"use client";

import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  fallbackClassName?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  className = "",
  fallbackText,
  fallbackClassName = "bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600",
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${fallbackClassName}`}
      >
        <span className="font-semibold text-lg">
          {fallbackText || alt}
        </span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
}

