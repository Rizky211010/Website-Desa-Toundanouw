import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Main Footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-10">
          {/* Info Desa */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl sm:rounded-2xl p-0.5 shadow-lg shadow-orange-500/25">
                <div className="w-full h-full bg-gray-900 rounded-[10px] sm:rounded-[14px] flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="Logo Desa Toundanouw"
                    width={48}
                    height={48}
                    className="object-contain w-8 h-8 sm:w-12 sm:h-12"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Desa Toundanouw</h3>
                <p className="text-xs sm:text-sm text-orange-400 font-medium">Kab. Minahasa Tenggara</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-5 sm:mb-8">
              Portal informasi resmi Pemerintah Desa Toundanouw, Kecamatan Touluaan. 
              Melayani warga dengan sepenuh hati untuk kemajuan desa yang lebih baik.
            </p>
            
            {/* Social Media */}
            <div className="flex items-center gap-2 sm:gap-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Youtube, href: "#", label: "Youtube" },
              ].map((social) => (
                <a 
                  key={social.label}
                  href={social.href} 
                  aria-label={social.label}
                  className="group w-9 h-9 sm:w-11 sm:h-11 bg-gray-800/50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25 border border-gray-700/50 hover:border-orange-500/50"
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Tautan Cepat */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-6 sm:w-8 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
              Tautan Cepat
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { href: "/profil", label: "Profil Desa" },
                { href: "/potensi", label: "Potensi Desa" },
                { href: "/berita", label: "Berita Desa" },
                { href: "/surat", label: "E-Surat" },
                { href: "/galeri", label: "Galeri" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group text-xs sm:text-sm text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center gap-2 sm:gap-3"
                  >
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-500/50 group-hover:bg-orange-500 rounded-full transition-colors" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Jelajahi */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-6 sm:w-8 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
              Jelajahi
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { href: "/jelajahi/organisasi", label: "Organisasi Desa" },
                { href: "/jelajahi/wilayah", label: "Wilayah Desa" },
                { href: "/jelajahi/penduduk", label: "Penduduk & Pekerjaan" },
                { href: "/kontak", label: "Hubungi Kami" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group text-xs sm:text-sm text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center gap-2 sm:gap-3"
                  >
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-500/50 group-hover:bg-orange-500 rounded-full transition-colors" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-6 sm:w-8 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
              Kontak Kami
            </h4>
            <ul className="space-y-3 sm:space-y-5">
              {[
                { icon: MapPin, text: "Desa Toundanouw, Kec. Touluaan, Kab. Minahasa Tenggara, Sulawesi Utara" },
                { icon: Phone, text: "+62 812-3456-7890" },
                { icon: Mail, text: "desa.toundanouw@gmail.com" },
                { icon: Clock, text: "Senin - Jumat: 08:00 - 15:00 WITA" },
              ].map((item, index) => (
                <li key={index} className="group flex items-start gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800/50 group-hover:bg-orange-500/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-colors border border-gray-700/50 group-hover:border-orange-500/30">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <span className="pt-1.5 sm:pt-2 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              © {currentYear} Pemerintah Desa Toundanouw. Hak cipta dilindungi.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1.5 sm:gap-2">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-orange-500"></span>
              </span>
              KKT 145{" "}
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 fill-orange-500" />{" "}
              Universitas Sam Ratulangi
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
