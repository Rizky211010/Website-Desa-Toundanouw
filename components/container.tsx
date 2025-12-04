import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Gunakan padding yang lebih kecil */
  compact?: boolean;
}

/**
 * Container - Wrapper untuk konten dengan max-width dan padding yang konsisten
 */
export function Container({
  children,
  className = "",
  compact = false,
}: ContainerProps) {
  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
        compact ? "py-6 sm:py-8" : "py-10 sm:py-16"
      } ${className}`}
    >
      {children}
    </div>
  );
}
