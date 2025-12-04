"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, Shield, MapPin, CheckCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Note: Middleware handles redirect if already logged in

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await loginUser(email, password);
      setSuccess("Login berhasil! Mengalihkan ke dashboard...");
      
      // Redirect ke dashboard setelah 1 detik
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Email atau password salah. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative - Premium */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 relative overflow-hidden">
        {/* Animated decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full animate-float" />
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-black/10">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
              Sistem Admin<br />
              <span className="text-white/90">Desa Toundanouw</span>
            </h1>
            <p className="text-white/80 text-lg max-w-md leading-relaxed">
              Portal administrasi untuk mengelola website desa, berita, layanan surat, dan informasi publik lainnya.
            </p>
          </div>
          
          {/* Features - Premium Cards */}
          <div className="space-y-4 mt-8">
            {[
              { icon: Shield, text: 'Akses aman & terlindungi' },
              { icon: null, svg: true, text: 'Kelola konten dengan mudah' },
              { icon: null, svg2: true, text: 'Dashboard real-time' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-white/90 group">
                <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/25 transition-all duration-300 shadow-lg shadow-black/10">
                  {feature.icon && <feature.icon className="w-5 h-5" />}
                  {feature.svg && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {feature.svg2 && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Right Side - Login Form - Premium */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
        <div className="w-full max-w-md">
          {/* Mobile Logo - Premium */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-0.5 shadow-xl shadow-orange-500/25 mb-6">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Logo Desa Toundanouw"
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Desa Toundanouw</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Sistem Admin</p>
          </div>

          {/* Desktop Header - Premium */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Selamat Datang!</h2>
            <p className="text-gray-500 mt-2 leading-relaxed">
              Masukkan email dan password untuk mengakses panel admin.
            </p>
          </div>

          {/* Login Form Card - Premium */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Success Message - Premium */}
              {success && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100/80 text-green-700 rounded-2xl text-sm shadow-sm">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{success}</span>
                </div>
              )}

              {/* Error Message - Premium */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-100/80 text-red-700 rounded-2xl text-sm shadow-sm">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Email - Premium */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@toundanouw.id"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                      placeholder:text-gray-400 transition-all duration-200
                      hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                    required
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password - Premium */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                      placeholder:text-gray-400 transition-all duration-200
                      hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                    required
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/admin/forgot-password"
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold transition-colors hover:underline"
                >
                  Lupa Password?
                </Link>
              </div>

              {/* Submit Button - Premium */}
              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 
                  bg-gradient-to-r from-orange-500 to-amber-500
                  text-white rounded-xl text-sm font-bold 
                  hover:from-orange-600 hover:to-amber-600
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  transition-all duration-300 
                  shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40
                  hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Masuk ke Dashboard
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer - Premium */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} Desa Toundanouw • Kecamatan Touluaan, Kabupaten Minahasa Tenggara
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Sulawesi Utara, Indonesia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
