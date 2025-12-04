"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  MapPin,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"email" | "check-email">("email");
  const [isChecking, setIsChecking] = useState(true);
  const [resetUrl, setResetUrl] = useState<string | null>(null); // For development

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          // Already logged in, redirect to dashboard
          router.push("/admin/dashboard");
        }
      } catch {
        // Not logged in, continue
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F28A2E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Memeriksa status login...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, email:', email); // Debug log
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      // Validate email format
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Silakan masukkan email yang valid");
        setIsSubmitting(false);
        return;
      }

      console.log('Calling API...'); // Debug log

      // Call API /api/auth/forgot-password
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      console.log('API Response status:', response.status); // Debug log

      const data = await response.json();
      console.log('API Response data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim reset link');
      }

      // In development, show the reset URL if available
      if (data.debug?.resetUrl) {
        console.log('Reset URL:', data.debug.resetUrl);
        setResetUrl(data.debug.resetUrl); // Store for display
      }

      setSuccess(
        `Email reset password telah dikirim ke ${email}. Silakan cek inbox Anda.`
      );
      setStep("check-email");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "check-email") {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#F28A2E] via-orange-500 to-amber-600 relative overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
                Reset Password<br />
                <span className="text-white/90">Desa Toundanouw</span>
              </h1>
              <p className="text-white/80 text-lg max-w-md">
                Silakan cek email Anda untuk tautan reset password.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-8">
          <div className="max-w-md mx-auto w-full">
            {/* Success Message */}
            <div className="mb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cek Email Anda
              </h2>
              <p className="text-gray-600">
                Kami telah mengirimkan tautan reset password ke <br />
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <span className="text-sm">Langkah berikutnya:</span>
              </h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Buka email dari Desa Toundanouw</li>
                <li>Klik tautan "Reset Password" di email</li>
                <li>Buat password baru Anda</li>
                <li>Kembali ke login dengan password baru</li>
              </ol>
            </div>

            {/* Development Mode - Show Reset Link */}
            {resetUrl && (
              <div className="mb-8 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 flex items-center gap-2 mb-2">
                  <span className="text-sm">🔧 Development Mode - Reset Link:</span>
                </h3>
                <p className="text-xs text-green-700 mb-3">
                  Karena belum ada email server, gunakan link berikut untuk reset password:
                </p>
                <Link
                  href={resetUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Klik untuk Reset Password
                </Link>
              </div>
            )}

            {/* Resend Option */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800 mb-8">
              <p className="mb-2">
                <strong>Tidak terima email?</strong>
              </p>
              <p className="mb-3">
                Silakan cek folder Spam atau hubungi admin desa untuk bantuan.
              </p>
              <button
                onClick={() => {
                  setStep("email");
                  setSuccess("");
                  setEmail("");
                }}
                className="text-amber-600 hover:text-amber-700 font-semibold text-sm"
              >
                Coba email lain
              </button>
            </div>

            {/* Back to Login */}
            <Link
              href="/admin/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 
                border-2 border-gray-200 text-gray-900 rounded-xl text-sm font-semibold
                hover:border-gray-300 hover:bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-[#F28A2E] focus:ring-offset-2
                transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#F28A2E] via-orange-500 to-amber-600 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              Lupa Password?<br />
              <span className="text-white/90">Kami Siap Membantu</span>
            </h1>
            <p className="text-white/80 text-lg max-w-md">
              Masukkan email Anda untuk menerima tautan reset password.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm">Email aman & terenkripsi</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                ⚡
              </div>
              <span className="text-sm">Proses reset instan</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                🔒
              </div>
              <span className="text-sm">Password Anda tetap aman</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-8">
        <div className="max-w-md mx-auto w-full">
          {/* Back button for mobile */}
          <Link
            href="/admin/login"
            className="lg:hidden flex items-center gap-2 text-[#F28A2E] font-semibold text-sm mb-8 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600">
              Masukkan email admin Anda dan kami akan mengirimkan tautan untuk
              reset password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@toundanouw.id"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]
                    placeholder:text-gray-400 transition-all"
                  required
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-xs">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 
                bg-gradient-to-r from-[#F28A2E] to-orange-500
                text-white rounded-xl text-sm font-semibold 
                hover:from-[#e07a1e] hover:to-orange-600
                focus:outline-none focus:ring-2 focus:ring-[#F28A2E] focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed 
                transition-all duration-200 shadow-lg shadow-orange-200/50
                active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Kirim Reset Link
                </>
              )}
            </button>

            {/* Back to Login Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Sudah ingat password?{" "}
                <Link
                  href="/admin/login"
                  className="text-[#F28A2E] font-semibold hover:text-orange-600 transition-colors"
                >
                  Kembali ke Login
                </Link>
              </p>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
            <p className="font-medium mb-1">💡 Tips:</p>
            <p>
              Jika email tidak diterima dalam 5 menit, cek folder Spam atau
              hubungi admin desa.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Desa Toundanouw • Kecamatan
            Touluaan, Kabupaten Minahasa Tenggara
          </p>
          <p className="text-xs text-gray-400 mt-1">Sulawesi Utara, Indonesia</p>
        </div>
      </div>
    </div>
  );
}
