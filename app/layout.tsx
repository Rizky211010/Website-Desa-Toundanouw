import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://website-desa-toundanouw.vercel.app"),
  title: {
    default: "Website Resmi Desa Toundanouw",
    template: "%s | Desa Toundanouw",
  },
  description:
    "Portal informasi resmi Desa Toundanouw, Kecamatan Touluaan, Kabupaten Minahasa Tenggara. Layanan publik, berita desa, dan download template surat.",
  keywords: [
    "desa toundanouw",
    "website desa",
    "layanan publik",
    "surat desa",
    "minahasa tenggara",
    "touluaan",
    "sulawesi utara",
  ],
  authors: [{ name: "KKT 145 Universitas Sam Ratulangi" }],
  creator: "KKT 145 UNSRAT",
  publisher: "Pemerintah Desa Toundanouw",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://website-desa-toundanouw.vercel.app",
    siteName: "Desa Toundanouw",
    title: "Website Resmi Desa Toundanouw",
    description:
      "Portal informasi resmi Desa Toundanouw, Kecamatan Touluaan, Kabupaten Minahasa Tenggara. Layanan publik, berita desa, dan download template surat.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Logo Desa Toundanouw",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Website Resmi Desa Toundanouw",
    description:
      "Portal informasi resmi Desa Toundanouw - Layanan publik, berita desa, dan download template surat.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
