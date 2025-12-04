"use client";

import { type LucideProps } from "lucide-react";
import {
  Home,
  Users,
  Leaf,
  Compass,
  Newspaper,
  FileText,
  Image,
  Phone,
  Building2,
  MapPin,
  BarChart3,
  LayoutDashboard,
  PenSquare,
  FolderOpen,
  Images,
  UserCog,
  Settings,
  TrendingUp,
  Upload,
  ShieldCheck,
  Mail,
  MessageCircle,
  Mountain,
  Sprout,
  FileDown,
  UsersRound,
  Map,
  ChartBar,
  Bell,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Search,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  ExternalLink,
  Download,
  Share2,
} from "lucide-react";
import { forwardRef } from "react";

// ============================================
// Icon Style Configuration
// ============================================

export const iconConfig = {
  // Premium color palette
  colors: {
    primary: "#F28A2E",      // Orange - brand color
    secondary: "#2F3C4E",    // Navy gray - elegant dark
    muted: "#6B7280",        // Soft gray
    light: "#9CA3AF",        // Light gray
    white: "#FFFFFF",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  // Refined stroke settings
  stroke: {
    thin: 1.25,
    normal: 1.5,
    medium: 1.75,
    bold: 2,
  },
  // Consistent sizes
  sizes: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    "2xl": 32,
  },
} as const;

// ============================================
// Base Icon Wrapper Component
// ============================================

interface IconWrapperProps extends LucideProps {
  variant?: "primary" | "secondary" | "muted" | "light" | "white" | "success" | "warning" | "error";
  iconSize?: keyof typeof iconConfig.sizes;
  strokeWeight?: keyof typeof iconConfig.stroke;
}

const withIconStyle = (
  IconComponent: React.ComponentType<LucideProps>,
  displayName: string
) => {
  const StyledIcon = forwardRef<SVGSVGElement, IconWrapperProps>(
    (
      {
        variant = "secondary",
        iconSize = "md",
        strokeWeight = "normal",
        className = "",
        ...props
      },
      ref
    ) => {
      const color = iconConfig.colors[variant];
      const size = iconConfig.sizes[iconSize];
      const strokeWidth = iconConfig.stroke[strokeWeight];

      const IconComp = IconComponent as React.ComponentType<LucideProps>;
      return (
        <IconComp
          ref={ref}
          size={size}
          strokeWidth={strokeWidth}
          color={color}
          className={`transition-colors duration-200 ${className}`}
          {...(props as LucideProps)}
        />
      );
    }
  );

  StyledIcon.displayName = displayName;
  return StyledIcon;
};

// ============================================
// Public/Warga Icons - Premium Styled
// ============================================

/** Beranda - Modern home icon */
export const IconHome = withIconStyle(Home, "IconHome");

/** Profil Desa - Building/village icon */
export const IconProfil = withIconStyle(Building2, "IconProfil");

/** Potensi Desa - Leaf/nature icon */
export const IconPotensi = withIconStyle(Leaf, "IconPotensi");

/** Potensi Alternatif - Mountain icon */
export const IconPotensiAlt = withIconStyle(Mountain, "IconPotensiAlt");

/** Potensi Alternatif 2 - Sprout icon */
export const IconPotensiSprout = withIconStyle(Sprout, "IconPotensiSprout");

/** Jelajahi - Compass icon */
export const IconJelajahi = withIconStyle(Compass, "IconJelajahi");

/** Berita - Newspaper icon */
export const IconBerita = withIconStyle(Newspaper, "IconBerita");

/** E-Surat - Document icon */
export const IconSurat = withIconStyle(FileText, "IconSurat");

/** E-Surat Download - Document with download */
export const IconSuratDownload = withIconStyle(FileDown, "IconSuratDownload");

/** Galeri - Image icon */
export const IconGaleri = withIconStyle(Image, "IconGaleri");

/** Galeri Multiple - Images icon */
export const IconGaleriMultiple = withIconStyle(Images, "IconGaleriMultiple");

/** Kontak - Phone icon */
export const IconKontak = withIconStyle(Phone, "IconKontak");

/** Kontak Email - Mail icon */
export const IconKontakEmail = withIconStyle(Mail, "IconKontakEmail");

/** Kontak Chat - Message icon */
export const IconKontakChat = withIconStyle(MessageCircle, "IconKontakChat");

// ============================================
// Jelajahi Sub-Icons
// ============================================

/** Organisasi Desa - Users group icon */
export const IconOrganisasi = withIconStyle(UsersRound, "IconOrganisasi");

/** Wilayah Desa - Map icon */
export const IconWilayah = withIconStyle(Map, "IconWilayah");

/** Wilayah Pin - Map pin icon */
export const IconWilayahPin = withIconStyle(MapPin, "IconWilayahPin");

/** Penduduk - Users icon */
export const IconPenduduk = withIconStyle(Users, "IconPenduduk");

/** Statistik Penduduk - Bar chart icon */
export const IconStatistikPenduduk = withIconStyle(BarChart3, "IconStatistikPenduduk");

// ============================================
// Admin Panel Icons
// ============================================

/** Dashboard - Layout dashboard icon */
export const IconDashboard = withIconStyle(LayoutDashboard, "IconDashboard");

/** Manajemen Berita - Edit document icon */
export const IconManajemenBerita = withIconStyle(PenSquare, "IconManajemenBerita");

/** Manajemen E-Surat - Folder icon */
export const IconManajemenSurat = withIconStyle(FolderOpen, "IconManajemenSurat");

/** Manajemen Galeri - Images icon */
export const IconManajemenGaleri = withIconStyle(Images, "IconManajemenGaleri");

/** Manajemen Pengguna - User settings icon */
export const IconManajemenUser = withIconStyle(UserCog, "IconManajemenUser");

/** Pengaturan - Settings icon */
export const IconPengaturan = withIconStyle(Settings, "IconPengaturan");

/** Statistik/Analytics - Trending icon */
export const IconAnalytics = withIconStyle(TrendingUp, "IconAnalytics");

/** Upload - Upload icon */
export const IconUpload = withIconStyle(Upload, "IconUpload");

/** Auth/Shield - Shield check icon */
export const IconAuth = withIconStyle(ShieldCheck, "IconAuth");

/** Notifikasi - Bell icon */
export const IconNotifikasi = withIconStyle(Bell, "IconNotifikasi");

// ============================================
// UI/Action Icons
// ============================================

/** Menu Hamburger */
export const IconMenu = withIconStyle(Menu, "IconMenu");

/** Close/X */
export const IconClose = withIconStyle(X, "IconClose");

/** Chevron Right */
export const IconChevronRight = withIconStyle(ChevronRight, "IconChevronRight");

/** Chevron Down */
export const IconChevronDown = withIconStyle(ChevronDown, "IconChevronDown");

/** Chevron Left */
export const IconChevronLeft = withIconStyle(ChevronLeft, "IconChevronLeft");

/** Search */
export const IconSearch = withIconStyle(Search, "IconSearch");

/** Logout */
export const IconLogout = withIconStyle(LogOut, "IconLogout");

/** Plus/Add */
export const IconPlus = withIconStyle(Plus, "IconPlus");

/** Edit */
export const IconEdit = withIconStyle(Edit, "IconEdit");

/** Delete/Trash */
export const IconDelete = withIconStyle(Trash2, "IconDelete");

/** View/Eye */
export const IconView = withIconStyle(Eye, "IconView");

/** Check/Success */
export const IconCheck = withIconStyle(Check, "IconCheck");

/** Alert/Warning */
export const IconAlert = withIconStyle(AlertCircle, "IconAlert");

/** Info */
export const IconInfo = withIconStyle(Info, "IconInfo");

/** Calendar */
export const IconCalendar = withIconStyle(Calendar, "IconCalendar");

/** Clock/Time */
export const IconClock = withIconStyle(Clock, "IconClock");

/** External Link */
export const IconExternalLink = withIconStyle(ExternalLink, "IconExternalLink");

/** Download */
export const IconDownload = withIconStyle(Download, "IconDownload");

/** Share */
export const IconShare = withIconStyle(Share2, "IconShare");

// ============================================
// Icon Map for Dynamic Usage
// ============================================

export const iconMap = {
  // Public
  home: IconHome,
  profil: IconProfil,
  potensi: IconPotensi,
  jelajahi: IconJelajahi,
  berita: IconBerita,
  surat: IconSurat,
  galeri: IconGaleri,
  kontak: IconKontak,
  organisasi: IconOrganisasi,
  wilayah: IconWilayah,
  penduduk: IconPenduduk,
  // Admin
  dashboard: IconDashboard,
  "manajemen-berita": IconManajemenBerita,
  "manajemen-surat": IconManajemenSurat,
  "manajemen-galeri": IconManajemenGaleri,
  "manajemen-user": IconManajemenUser,
  pengaturan: IconPengaturan,
  analytics: IconAnalytics,
  upload: IconUpload,
  auth: IconAuth,
  notifikasi: IconNotifikasi,
  // UI
  menu: IconMenu,
  close: IconClose,
  search: IconSearch,
  logout: IconLogout,
  plus: IconPlus,
  edit: IconEdit,
  delete: IconDelete,
  view: IconView,
} as const;

export type IconName = keyof typeof iconMap;

// ============================================
// Dynamic Icon Component
// ============================================

interface DynamicIconProps extends IconWrapperProps {
  name: IconName;
}

export function Icon({ name, ...props }: DynamicIconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <IconComponent {...props} />;
}

// ============================================
// Preset Icon Variants for Common Use Cases
// ============================================

/** Navbar icon preset - lighter stroke, muted color */
export function NavIcon({ name, active = false, ...props }: DynamicIconProps & { active?: boolean }) {
  return (
    <Icon
      name={name}
      variant={active ? "primary" : "secondary"}
      strokeWeight="normal"
      iconSize="md"
      {...props}
    />
  );
}

/** Sidebar icon preset */
export function SidebarIcon({ name, active = false, ...props }: DynamicIconProps & { active?: boolean }) {
  return (
    <Icon
      name={name}
      variant={active ? "primary" : "muted"}
      strokeWeight="normal"
      iconSize="md"
      {...props}
    />
  );
}

/** Button icon preset - smaller size */
export function ButtonIcon({ name, ...props }: DynamicIconProps) {
  return (
    <Icon
      name={name}
      variant="white"
      strokeWeight="medium"
      iconSize="sm"
      {...props}
    />
  );
}

/** Card icon preset - larger, primary color */
export function CardIcon({ name, ...props }: DynamicIconProps) {
  return (
    <Icon
      name={name}
      variant="primary"
      strokeWeight="normal"
      iconSize="lg"
      {...props}
    />
  );
}
