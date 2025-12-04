import Link from "next/link";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Container, Button } from "@/components";

export default function BeritaNotFound() {
  return (
    <section className="bg-gray-50 dark:bg-slate-800/50 min-h-[60vh] flex items-center">
      <Container>
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Berita Tidak Ditemukan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Maaf, berita yang Anda cari tidak ditemukan atau mungkin telah
            dihapus.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/berita" variant="primary">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Berita
            </Button>
            <Button href="/" variant="outline">
              <Home className="w-4 h-4" />
              Ke Beranda
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
