"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Building, FileText, Clock, Users, MapPin, File, Wifi } from "lucide-react";
import { Container, Button } from "@/components";

interface HeroSlide {
  id: string;
  order_index: number;
  headline: string;
  subheadline: string | null;
  image_url: string | null;
  primary_button_text: string | null;
  primary_button_url: string | null;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  is_active: boolean;
}

interface HeroStats {
  penduduk: number;
  wilayah: number;
  suratTemplates: number;
}

// Default slide untuk fallback
const defaultSlide: HeroSlide = {
  id: "default",
  order_index: 1,
  headline: "Selamat Datang di Desa Toundanouw",
  subheadline: "Kecamatan Touluaan, Kabupaten Minahasa Tenggara, Sulawesi Utara. Portal informasi desa dan layanan administrasi digital untuk kemudahan warga.",
  image_url: null,
  primary_button_text: "Profil Desa",
  primary_button_url: "/profil",
  secondary_button_text: "Layanan E-Surat",
  secondary_button_url: "/surat",
  is_active: true,
};

// Default stats
const defaultStats: HeroStats = {
  penduduk: 1500,
  wilayah: 5,
  suratTemplates: 15,
};

// Stats config with icons
const statsConfig = [
  { key: 'penduduk', icon: Users, label: 'Jiwa Penduduk', suffix: '+' },
  { key: 'wilayah', icon: MapPin, label: 'Wilayah/Jaga', suffix: '' },
  { key: 'suratTemplates', icon: File, label: 'Template Surat', suffix: '+' },
  { key: 'online', icon: Wifi, label: 'Akses Online', value: '24/7' },
] as const;

export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([defaultSlide]);
  const [stats, setStats] = useState<HeroStats>(defaultStats);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY * 0.5);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch("/api/hero-slides?active=true");
        const result = await response.json();

        if (response.ok && result.data && result.data.length > 0) {
          setSlides(result.data);
        }
      } catch (error) {
        console.error("Error fetching hero slides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Fetch stats from API - with refetch capability
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/stats", { cache: 'no-store' });
      const result = await response.json();

      if (response.ok && result.data) {
        setStats({
          penduduk: result.data.penduduk || defaultStats.penduduk,
          wilayah: result.data.wilayah || defaultStats.wilayah,
          suratTemplates: result.data.suratTemplates || defaultStats.suratTemplates,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Refetch stats when window gets focus (user comes back to tab)
    const handleFocus = () => fetchStats();
    window.addEventListener('focus', handleFocus);
    
    // Also refetch every 30 seconds for realtime updates
    const interval = setInterval(fetchStats, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchStats]);

  // Auto-slide
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const currentSlide = slides[currentIndex];

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden min-h-[100svh] sm:min-h-[90vh] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700" />
      
      {/* Background Image with Parallax */}
      {currentSlide?.image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out"
          style={{ 
            backgroundImage: `url(${currentSlide.image_url})`,
            transform: `translateY(${scrollY * 0.3}px) scale(1.1)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-900/50 via-transparent to-transparent" />
        </div>
      )}

      {/* Animated Background Pattern (when no image) */}
      {!currentSlide?.image_url && (
        <>
          {/* Gradient Mesh Background */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-30"
              style={{ transform: `translateY(${scrollY * 0.2}px)` }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(251,191,36,0.3)_0%,_transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(234,88,12,0.4)_0%,_transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
            </div>
          </div>

          {/* Animated Pattern */}
          <div className="absolute inset-0 opacity-[0.07]">
            <div className="absolute inset-0 hero-pattern" />
          </div>

          {/* Floating Blobs with Parallax */}
          <div 
            className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-yellow-400/30 to-orange-400/20 rounded-full blur-3xl animate-float"
            style={{ transform: `translateY(${scrollY * -0.2}px)` }}
          />
          <div 
            className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-orange-600/30 to-red-500/20 rounded-full blur-3xl"
            style={{ 
              transform: `translateY(${scrollY * -0.15}px)`,
              animation: 'float 10s ease-in-out infinite reverse'
            }}
          />
          <div 
            className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-white/10 rounded-full blur-2xl"
            style={{ 
              transform: `translateY(${scrollY * -0.1}px)`,
              animation: 'float 8s ease-in-out infinite 2s'
            }}
          />
        </>
      )}

      {/* Content */}
      <Container className="relative py-16 sm:py-24 lg:py-32 z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-5 sm:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20 shadow-lg animate-fade-in-down"
              style={{ animationDelay: '100ms' }}
            >
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-yellow-400" />
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/95">
                Portal Resmi Pemerintah Desa
              </span>
            </div>

            {/* Headline with Gradient */}
            <h1
              key={currentSlide?.id}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight text-white animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              <span className="block">{currentSlide?.headline?.split(' ').slice(0, 2).join(' ') || "Selamat Datang"}</span>
              <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-yellow-200 via-yellow-300 to-orange-200 bg-clip-text text-transparent">
                {currentSlide?.headline?.split(' ').slice(2).join(' ') || ""}
              </span>
            </h1>

            {/* Subheadline */}
            {currentSlide?.subheadline && (
              <p 
                className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up"
                style={{ animationDelay: '300ms' }}
              >
                {currentSlide.subheadline}
              </p>
            )}

            {/* Buttons */}
            <div 
              className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 pt-2 animate-fade-in-up"
              style={{ animationDelay: '400ms' }}
            >
              {currentSlide?.primary_button_text && currentSlide?.primary_button_url && (
                <Button 
                  href={currentSlide.primary_button_url} 
                  size="lg" 
                  className="group bg-white text-orange-600 hover:bg-orange-50 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl w-full sm:w-auto"
                >
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                  {currentSlide.primary_button_text}
                </Button>
              )}
              {currentSlide?.secondary_button_text && currentSlide?.secondary_button_url && (
                <Button
                  href={currentSlide.secondary_button_url}
                  size="lg"
                  variant="outline"
                  className="group border-2 border-white/50 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl w-full sm:w-auto"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                  {currentSlide.secondary_button_text}
                </Button>
              )}
            </div>

            {/* Service Hours */}
            <div 
              className="flex items-center justify-center lg:justify-start gap-3 text-xs sm:text-sm text-white/70 pt-2 sm:pt-4 animate-fade-in-up"
              style={{ animationDelay: '500ms' }}
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
              </div>
              <div>
                <p className="font-medium text-white/90">Jam Layanan Kantor Desa</p>
                <p>Senin - Jumat, 08:00 - 15:00 WITA</p>
              </div>
            </div>
          </div>

          {/* Stats Cards - Premium Design */}
          <div className="hidden lg:block">
            <div 
              className="grid grid-cols-2 gap-5 animate-fade-in-left"
              style={{ 
                animationDelay: '300ms',
                transform: `translateY(${scrollY * -0.1}px)` 
              }}
            >
              {statsConfig.map((stat, index) => {
                const Icon = stat.icon;
                const value = stat.key === 'online' 
                  ? stat.value 
                  : `${(stats[stat.key as keyof HeroStats] || 0).toLocaleString('id-ID')}${stat.suffix}`;
                
                return (
                  <div 
                    key={stat.key}
                    className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden"
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    {/* Hover Gradient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Icon */}
                    <div className="relative flex justify-center mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                        <Icon className="w-6 h-6 text-yellow-300" />
                      </div>
                    </div>
                    
                    {/* Value */}
                    <div className="relative text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tight">
                      {value}
                    </div>
                    
                    {/* Label */}
                    <div className="relative text-sm text-white/70 font-medium">
                      {stat.label}
                    </div>
                    
                    {/* Bottom Accent Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="lg:hidden mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {statsConfig.map((stat) => {
            const Icon = stat.icon;
            const value = stat.key === 'online' 
              ? stat.value 
              : `${(stats[stat.key as keyof HeroStats] || 0).toLocaleString('id-ID')}${stat.suffix}`;
            
            return (
              <div 
                key={stat.key}
                className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 text-center border border-white/20"
              >
                <div className="flex justify-center mb-1 sm:mb-2">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white">{value}</div>
                <div className="text-[10px] sm:text-xs text-white/70 leading-tight">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </Container>

      {/* Slider Navigation */}
      {slides.length > 1 && (
        <>
          {/* Prev/Next Buttons - Premium Style */}
          <button
            onClick={goToPrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Dots Indicator - Premium Style */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-sm rounded-full">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative h-2.5 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? "w-10 bg-white"
                    : "w-2.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentIndex && (
                  <span className="absolute inset-0 rounded-full bg-white animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Bottom Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]">
        <svg
          className="relative block w-full h-16 sm:h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z"
            className="fill-white dark:fill-gray-900"
          />
        </svg>
      </div>
    </section>
  );
}
