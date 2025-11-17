import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

export default function Blog() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Blog</h1>
          <p className="text-gray-400 text-lg mb-8">
            Stay updated with the latest insights, tutorials, and stories from our community.
          </p>
          <div className="inline-block px-4 py-2 border border-white/10 text-gray-500 text-sm">
            Coming soon
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
