/**
 * Layout untuk halaman autentikasi admin (login, forgot-password, reset-password)
 * Tidak menggunakan AdminAuthGuard karena ini adalah halaman publik
 */

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
