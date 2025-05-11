import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Communities from "./components/Communities";
// import Testimonials from "./components/Testimonials";
import Mentors from "./components/Mentors";
import Footer from "./components/Footer";
import FeaturedProjects from "./components/FeaturedProjects";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="pt-[var(--navbar-height)]">
        <Hero />
        <About />
        <Communities />
        <FeaturedProjects />
        {/* <Testimonials /> */}
        <Mentors />
      </main>
      <Footer />
    </div>
  );
}
