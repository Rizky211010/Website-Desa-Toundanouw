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
        bg-slate-800 rounded-2xl border border-slate-700 shadow-sm
        ${hoverable ? "hover:shadow-md hover:border-slate-600 transition-all duration-200" : ""}
        ${className}
      `}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div>
            {title && (
              <h3 className="font-semibold text-gray-100">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
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
    orange: "bg-orange-900/30 text-orange-400",
    blue: "bg-blue-900/30 text-blue-400",
    green: "bg-green-900/30 text-green-400",
    purple: "bg-purple-900/30 text-purple-400",
    red: "bg-red-900/30 text-red-400",
    yellow: "bg-yellow-900/30 text-yellow-400",
    gray: "bg-slate-700 text-gray-400",
  };

  const iconBgClasses = {
    orange: "bg-orange-900/50",
    blue: "bg-blue-900/50",
    green: "bg-green-900/50",
    purple: "bg-purple-900/50",
    red: "bg-red-900/50",
    yellow: "bg-yellow-900/50",
    gray: "bg-slate-700",
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-100 mt-2">{value}</p>
          {trend && (
            <p
              className={`text-xs font-medium mt-2 ${
                trend.positive ? "text-green-400" : "text-red-400"
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
