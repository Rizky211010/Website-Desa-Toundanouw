import { ReactNode } from "react";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

export function AdminCard({
  children,
  className = "",
  title,
  subtitle,
  action,
  padding = "md",
  hoverable = false,
}: AdminCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-100 shadow-sm
        ${hoverable ? "hover:shadow-md hover:border-gray-200 transition-all duration-200" : ""}
        ${className}
      `}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            {title && (
              <h3 className="font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
}

// Stats Card variant
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: "orange" | "blue" | "green" | "purple" | "red" | "yellow" | "gray";
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  color = "orange",
}: StatsCardProps) {
  const colorClasses = {
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    gray: "bg-gray-50 text-gray-600",
  };

  const iconBgClasses = {
    orange: "bg-orange-100",
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    red: "bg-red-100",
    yellow: "bg-yellow-100",
    gray: "bg-gray-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p
              className={`text-xs font-medium mt-2 ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          <div className={colorClasses[color]}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
