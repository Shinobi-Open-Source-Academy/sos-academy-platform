"use client";

import { useState } from "react";
import Image from "next/image";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to a newsletter API
    console.log("Subscribing email:", email);
    setEmail("");
    // Show success message
  };

  return (
    <div>
      <div className="mb-8">
        <Image
          src="/shinobiLogo.png"
          alt="Shinobi Open-Source Academy"
          width={100}
          height={100}
          className="hover:scale-110 transition-all duration-300"
        />
        <h3 className="text-xl font-bold mt-4 mb-2">
          Shinobi Open-Source Academy
        </h3>
        <p className="text-gray-400">
          Empowering the Next Generation of Open-Source Warriors
        </p>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-4">Stay Updated</h4>
        <p className="text-gray-400 mb-4">
          Subscribe to our newsletter to get the latest updates on our
          communities, projects, and upcoming events.
        </p>
        <form
          onSubmit={handleSubscribe}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-primary w-full"
          />
          <button
            type="submit"
            className="btn-primary whitespace-nowrap shrink-0"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
