import Link from "next/link";
import { COMMUNITIES_CONSTANTS } from "@/app/constants/communities";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function CommunityNotFound() {
  return (
    <main className={COMMUNITIES_CONSTANTS.STYLE.SECTION_BG}>
      <Navbar />

      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Community Not Found
          </h1>
          <p className="text-gray-300 mb-8">
            The community you&apos;re looking for doesn&apos;t exist or may have
            been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#communities"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Browse Communities
            </Link>
            <Link
              href="/"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
