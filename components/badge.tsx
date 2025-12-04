import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "info" | "danger" | "primary" | "outline";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  /** Shimmer animation effect */
  shimmer?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 border border-gray-200/50 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600",
  primary: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200/50 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/30",
  success: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30",
  warning: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30",
  info: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30",
  danger: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200/50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30",
  outline: "bg-transparent text-gray-700 border-2 border-gray-300 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800",
};

/**
 * Badge - Label kecil untuk kategori atau status dengan premium styling
 */
export function Badge({
  children,
  variant = "default",
  className = "",
  shimmer = false,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold
        shadow-sm transition-all duration-200 hover:shadow-md
        ${variantStyles[variant]} 
        ${shimmer ? 'animate-shimmer bg-[length:200%_100%]' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
