import { ReactNode } from "react";
import { Users, Newspaper, FileText, Mountain, TrendingUp, TrendingDown } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: "orange" | "blue" | "green" | "purple";
  trend?: {
    value: string;
    positive: boolean;
  };
}

interface AdminStatsProps {
  stats: StatItem[];
}

export function AdminStats({ stats }: AdminStatsProps) {
  const colorClasses = {
    orange: {
      bg: "bg-orange-50",
      icon: "bg-orange-100 text-orange-600",
      trend: "text-orange-600",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      trend: "text-blue-600",
    },
    green: {
      bg: "bg-green-50",
      icon: "bg-green-100 text-green-600",
      trend: "text-green-600",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "bg-purple-100 text-purple-600",
      trend: "text-purple-600",
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
              {stat.trend && (
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend.positive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      stat.trend.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend.value}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${colorClasses[stat.color].icon}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Default stats for dashboard
export function DashboardStats() {
  const stats: StatItem[] = [
    {
      label: "Total Penduduk",
      value: "1,508",
      icon: <Users className="w-6 h-6" />,
      color: "orange",
      trend: { value: "+12 bulan ini", positive: true },
    },
    {
      label: "Total Berita",
      value: "24",
      icon: <Newspaper className="w-6 h-6" />,
      color: "blue",
      trend: { value: "+3 minggu ini", positive: true },
    },
    {
      label: "Jenis E-Surat",
      value: "15",
      icon: <FileText className="w-6 h-6" />,
      color: "green",
    },
    {
      label: "Potensi Desa",
      value: "8",
      icon: <Mountain className="w-6 h-6" />,
      color: "purple",
      trend: { value: "+2 baru", positive: true },
    },
  ];

  return <AdminStats stats={stats} />;
}
