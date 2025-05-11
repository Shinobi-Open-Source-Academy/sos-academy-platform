"use client";

import Newsletter from "./footer/Newsletter";
import QuickLinks from "./footer/QuickLinks";
import ContactInfo from "./footer/ContactInfo";

export default function Footer() {
  return (
    <footer
      id="join"
      className="bg-gray-950 text-white py-16 border-t border-gray-800/30"
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16">
          <Newsletter />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <QuickLinks />
            <ContactInfo />
          </div>
        </div>

        <div className="border-t border-gray-800/40 mt-16 pt-8 text-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} Shinobi Open-Source Academy. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
