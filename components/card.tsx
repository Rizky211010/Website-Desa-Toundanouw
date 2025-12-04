import { ReactNode, CSSProperties } from "react";

type CardVariant = "default" | "elevated" | "glass" | "gradient" | "highlight";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Hilangkan padding default */
  noPadding?: boolean;
  /** Tampilkan hover effect */
  hoverable?: boolean;
  /** Premium glass effect - deprecated, use variant="glass" */
  glass?: boolean;
  /** Gradient background - deprecated, use variant="gradient" */
  gradient?: boolean;
  /** Card variant for premium styling */
  variant?: CardVariant;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * Card - Premium wrapper dengan background, border, dan shadow
 */
export function Card({
  children,
  className = "",
  noPadding = false,
  hoverable = false,
  glass = false,
  gradient = false,
  variant = "default",
  style,
}: CardProps) {
  const baseClasses = "relative rounded-2xl overflow-hidden";
  
  // Determine variant from props (backward compatibility)
  const effectiveVariant = glass ? "glass" : gradient ? "gradient" : variant;
  
  const variantClasses: Record<CardVariant, string> = {
    default: "bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700",
    elevated: "bg-white dark:bg-slate-800 border border-gray-100/80 dark:border-slate-700 shadow-xl shadow-gray-200/60 dark:shadow-black/30",
    glass: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/50",
    gradient: "bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/50 border border-gray-100/80 dark:border-slate-700",
    highlight: "bg-gradient-to-br from-orange-50 via-white to-amber-50/50 dark:from-orange-900/20 dark:via-slate-800 dark:to-amber-900/10 border border-orange-200/50 dark:border-orange-800/30",
  };
  
  const bgClasses = variantClasses[effectiveVariant];
  
  const shadowClasses = effectiveVariant === "elevated" 
    ? "" 
    : "shadow-lg shadow-gray-200/50 dark:shadow-none";
  
  const hoverClasses = hoverable
    ? "transition-all duration-500 hover:shadow-2xl hover:shadow-gray-300/60 dark:hover:shadow-black/30 hover:-translate-y-1 hover:border-orange-200/80 dark:hover:border-orange-700/50"
    : "";
  
  const paddingClasses = noPadding ? "" : "p-5 sm:p-6";

  return (
    <div
      className={`${baseClasses} ${bgClasses} ${shadowClasses} ${hoverClasses} ${paddingClasses} ${className}`}
      style={style}
    >
      {/* Subtle gradient overlay on hover */}
      {hoverable && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-amber-50/0 group-hover:from-orange-50/50 group-hover:to-amber-50/30 dark:group-hover:from-orange-900/10 dark:group-hover:to-amber-900/5 transition-all duration-500 pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /** Show a colored accent bar on the left */
  accent?: "orange" | "blue" | "green" | "purple" | "yellow";
}

export function CardHeader({ title, subtitle, action, accent }: CardHeaderProps) {
  const accentColors = {
    orange: "from-orange-500 to-amber-500",
    blue: "from-blue-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-violet-500",
    yellow: "from-yellow-500 to-amber-500",
  };

  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        {accent && (
          <div className={`w-1 h-full min-h-[40px] rounded-full bg-gradient-to-b ${accentColors[accent]}`} />
        )}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Premium Stat Card for dashboards
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "orange" | "blue" | "green" | "purple" | "yellow";
  className?: string;
}

export function StatCard({ label, value, icon, trend, color = "orange", className = "" }: StatCardProps) {
  const colorMap = {
    orange: {
      iconBg: "from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30",
      iconText: "text-orange-600 dark:text-orange-400",
      accent: "from-orange-500 to-amber-500",
    },
    blue: {
      iconBg: "from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30",
      iconText: "text-blue-600 dark:text-blue-400",
      accent: "from-blue-500 to-indigo-500",
    },
    green: {
      iconBg: "from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30",
      iconText: "text-green-600 dark:text-green-400",
      accent: "from-green-500 to-emerald-500",
    },
    purple: {
      iconBg: "from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30",
      iconText: "text-purple-600 dark:text-purple-400",
      accent: "from-purple-500 to-violet-500",
    },
    yellow: {
      iconBg: "from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30",
      iconText: "text-yellow-600 dark:text-yellow-400",
      accent: "from-yellow-500 to-amber-500",
    },
  };

  const colors = colorMap[color];

  return (
    <div className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden ${className}`}>
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-gray-400 font-normal">vs bulan lalu</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <div className={colors.iconText}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

