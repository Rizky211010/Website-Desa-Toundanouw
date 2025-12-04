import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 lg:mb-8">
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-600" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-200 font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">{title}</h1>
          {subtitle && (
            <p className="text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
