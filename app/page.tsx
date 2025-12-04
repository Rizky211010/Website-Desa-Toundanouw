import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import PublicHomePage from "./(public)/page";

/**
 * Root page - render homepage dengan Navbar dan Footer
 * Karena file ini di luar route group (public), perlu import komponen secara manual
 */
export default function RootPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PublicHomePage />
      </main>
      <Footer />
    </>
  );
}

