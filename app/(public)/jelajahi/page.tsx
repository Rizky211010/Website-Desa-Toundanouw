import Link from "next/link";
import { Users, MapPin, BarChart3, ArrowRight, Building2, History } from "lucide-react";
import { Container, Card, Button } from "@/components";
import { PageHeader } from "@/components/page-header";

const jelajahiMenu = [
  {
    title: "Sejarah Desa",
    description: "Perjalanan sejarah dan perkembangan Desa Toundanouw dari masa ke masa.",
    href: "/jelajahi/sejarah",
    icon: History,
    color: "amber",
    image: "/images/sejarah.jpg",
  },
  {
    title: "Organisasi Desa",
    description: "Lihat struktur pemerintahan dan perangkat Desa Toundanouw beserta tugas dan fungsinya.",
    href: "/jelajahi/organisasi",
    icon: Users,
    color: "orange",
    image: "/images/organisasi.jpg",
  },
  {
    title: "Wilayah Desa",
    description: "Informasi geografis, batas wilayah, dan pembagian administratif desa.",
    href: "/jelajahi/wilayah",
    icon: MapPin,
    color: "green",
    image: "/images/wilayah.jpg",
  },
  {
    title: "Penduduk & Pekerjaan",
    description: "Statistik demografi, jumlah penduduk, dan mata pencaharian masyarakat.",
    href: "/jelajahi/penduduk",
    icon: BarChart3,
    color: "blue",
    image: "/images/penduduk.jpg",
  },
];

const colorClasses = {
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    icon: "text-amber-600 dark:text-amber-400",
    hover: "group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50",
    border: "border-amber-500",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    icon: "text-orange-600 dark:text-orange-400",
    hover: "group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50",
    border: "border-orange-500",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    icon: "text-green-600 dark:text-green-400",
    hover: "group-hover:bg-green-200 dark:group-hover:bg-green-900/50",
    border: "border-green-500",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: "text-blue-600 dark:text-blue-400",
    hover: "group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50",
    border: "border-blue-500",
  },
};

export default function JelajahiPage() {
  return (
    <>
      <PageHeader
        title="Jelajahi Desa"
        subtitle="Temukan informasi lengkap tentang pemerintahan, wilayah, dan masyarakat Desa Toundanouw"
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Jelajahi" }]}
      />

      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 py-16 sm:py-20 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-200/20 dark:bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <Container className="relative">
          {/* 4 Column Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {jelajahiMenu.map((item, index) => {
              const colors = colorClasses[item.color as keyof typeof colorClasses];
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="group animate-fadeInUp" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card
                    hoverable
                    className={`h-full flex flex-col transition-all duration-500 border-t-4 ${colors.border} p-6 hover:shadow-2xl hover:-translate-y-2`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-18 h-18 ${colors.bg} ${colors.hover} rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}
                    >
                      <item.icon className={`w-9 h-9 ${colors.icon}`} />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 flex-1 leading-relaxed">
                      {item.description}
                    </p>
                    
                    {/* CTA */}
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold group-hover:gap-4 transition-all duration-300">
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-16 bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 dark:from-orange-900/20 dark:via-yellow-900/10 dark:to-orange-900/20 rounded-3xl p-8 border border-orange-100/50 dark:border-orange-800/30 shadow-xl animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Butuh informasi lainnya?</h4>
                  <p className="text-gray-600 dark:text-gray-400">Kunjungi halaman profil untuk info lebih lengkap</p>
                </div>
              </div>
              <Button href="/profil" variant="primary" className="shadow-lg hover:shadow-xl">
                Lihat Profil Desa
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
