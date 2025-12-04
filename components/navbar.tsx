"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

// Navigation items - text only, professional
const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil Desa" },
  { href: "/potensi", label: "Potensi Desa" },
  { 
    href: "/jelajahi", 
    label: "Jelajahi", 
    submenu: [
      { href: "/jelajahi/sejarah", label: "Sejarah Desa" },
      { href: "/jelajahi/organisasi", label: "Organisasi Desa" },
      { href: "/jelajahi/wilayah", label: "Wilayah Desa" },
      { href: "/jelajahi/penduduk", label: "Penduduk & Pekerjaan" },
    ]
  },
  { href: "/berita", label: "Berita" },
  { href: "/surat", label: "E-Surat" },
  { href: "/galeri", label: "Galeri" },
  { href: "/kontak", label: "Kontak" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  // Check if current path matches nav item
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100/80 shadow-sm shadow-gray-900/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo / Nama Desa - Premium Design */}
          <Link
            href="/"
            className="flex items-center gap-3 lg:gap-4 group"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              {/* Logo container */}
              <div className="relative w-11 h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-0.5 shadow-lg shadow-orange-500/20 group-hover:shadow-xl group-hover:shadow-orange-500/30 transition-all duration-300">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Logo Desa Toundanouw"
                    className="w-8 h-8 lg:w-9 lg:h-9 object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-900 text-lg leading-tight tracking-tight group-hover:text-orange-600 transition-colors">Desa Toundanouw</p>
              <p className="text-xs text-orange-600 font-semibold">Kab. Minahasa Tenggara</p>
            </div>
          </Link>

          {/* Desktop Navigation - Premium with Pill Design */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-50/80 backdrop-blur-sm rounded-full px-2 py-1.5 border border-gray-100/50">
            {navItems.map((item) => (
              <div key={item.href} className="relative">
                {item.submenu ? (
                  <button
                    className={`
                      relative px-4 py-2 text-sm font-semibold rounded-full
                      transition-all duration-300 ease-out
                      flex items-center gap-1.5
                      ${isActive(item.href) 
                        ? "text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25" 
                        : "text-gray-600 hover:text-orange-600 hover:bg-white hover:shadow-sm"
                      }
                    `}
                    onMouseEnter={() => setOpenSubmenu(item.href)}
                    onMouseLeave={() => setOpenSubmenu(null)}
                  >
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSubmenu === item.href ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`
                      relative px-4 py-2 text-sm font-semibold rounded-full
                      transition-all duration-300 ease-out
                      ${isActive(item.href) 
                        ? "text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25" 
                        : "text-gray-600 hover:text-orange-600 hover:bg-white hover:shadow-sm"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                )}
                
                {/* Submenu Dropdown - Premium */}
                {item.submenu && (
                  <div 
                    className={`
                      absolute top-full left-1/2 -translate-x-1/2 mt-3 w-60 
                      bg-white/95 backdrop-blur-xl rounded-2xl 
                      shadow-2xl shadow-gray-900/15
                      border border-gray-200/80 py-2 
                      transition-all duration-300 ease-out origin-top
                      ${openSubmenu === item.href 
                        ? 'opacity-100 visible scale-100 translate-y-0' 
                        : 'opacity-0 invisible scale-95 -translate-y-2'
                      }
                    `}
                    onMouseEnter={() => setOpenSubmenu(item.href)}
                    onMouseLeave={() => setOpenSubmenu(null)}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200/80" />
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`
                          relative block px-5 py-3 text-sm font-medium
                          transition-all duration-200
                          ${isActive(sub.href)
                            ? "text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50"
                            : "text-gray-600 hover:text-orange-600 hover:bg-gray-50 hover:pl-6"
                          }
                        `}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu Button - Premium */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`
              lg:hidden p-2.5 rounded-xl
              transition-all duration-300 active:scale-95
              ${isMobileMenuOpen 
                ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30" 
                : "text-gray-700 bg-gray-50 hover:bg-gray-100"
              }
            `}
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <div className="relative w-5 h-5">
              <X className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
              <Menu className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation - Premium */}
        <div 
          className={`
            lg:hidden overflow-hidden
            transition-all duration-300 ease-out
            ${isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="py-4 border-t border-gray-100">
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => (
                <div key={item.href}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => setOpenSubmenu(openSubmenu === item.href ? null : item.href)}
                        className={`
                          flex items-center justify-between w-full px-4 py-3.5 
                          text-base font-semibold rounded-xl
                          transition-all duration-300
                          ${isActive(item.href) 
                            ? "text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50" 
                            : "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                          }
                        `}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSubmenu === item.href ? 'rotate-180' : ''}`} />
                      </button>
                      <div 
                        className={`
                          overflow-hidden transition-all duration-300 ease-out
                          ${openSubmenu === item.href ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                        `}
                      >
                        <div className="ml-4 mt-2 space-y-1 border-l-2 border-gradient-to-b border-orange-300 pl-4">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`
                                block px-4 py-2.5 text-sm font-medium rounded-xl
                                transition-all duration-200
                                ${isActive(sub.href)
                                  ? "text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50"
                                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/50"
                                }
                              `}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        block px-4 py-3.5 text-base font-semibold rounded-xl
                        transition-all duration-300
                        ${isActive(item.href) 
                          ? "text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25" 
                          : "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
