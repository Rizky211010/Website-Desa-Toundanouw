import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Container } from "./container";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  /** Judul halaman */
  title: string;
  /** Deskripsi/subtitle opsional */
  description?: string;
  /** Subtitle alternatif */
  subtitle?: string;
  /** Aksi tambahan seperti tombol */
  actions?: ReactNode;
  /** Alignment konten */
  align?: "left" | "center";
  /** Breadcrumb navigation */
  breadcrumb?: BreadcrumbItem[];
}

/**
 * PageHeader - Header standar untuk setiap halaman dengan breadcrumb - Premium Design
 */
export function PageHeader({
  title,
  description,
  subtitle,
  actions,
  align = "center",
  breadcrumb,
}: PageHeaderProps) {
  const displaySubtitle = subtitle || description;

  return (
    <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white relative overflow-hidden">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ 
        backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Decorative elements - Premium */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/15 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-amber-300/10 rounded-full blur-xl" />

      <Container className="relative py-14 sm:py-20">
        {/* Breadcrumb - Premium */}
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-2 text-sm mb-8 justify-center">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-all duration-200 px-2.5 py-1.5 rounded-lg hover:bg-white/10"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Beranda</span>
            </Link>
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-white/50" />
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-white transition-all duration-200 font-medium px-2.5 py-1.5 rounded-lg hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-white font-semibold bg-white/15 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    {item.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className={align === "center" ? "text-center" : ""}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 tracking-tight animate-fadeIn">
            {title}
          </h1>
          {displaySubtitle && (
            <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              {displaySubtitle}
            </p>
          )}
          {actions && (
            <div className="mt-8 flex gap-4 flex-wrap justify-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              {actions}
            </div>
          )}
        </div>
      </Container>
      
      {/* Bottom curved edge */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-6 text-white dark:text-slate-900" preserveAspectRatio="none" viewBox="0 0 1200 24" fill="currentColor">
          <path d="M0,0 C200,24 400,24 600,12 C800,0 1000,0 1200,12 L1200,24 L0,24 Z" />
        </svg>
      </div>
    </section>
  );
}
