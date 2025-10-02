"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SubscriptionModal from "../components/SubscriptionModal";
import MentorApplicationModal from "../components/MentorApplicationModal";

export default function Documentation() {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isMentorApplicationModalOpen, setIsMentorApplicationModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Navbar />
      <main className="pt-[var(--navbar-height)]">
        <div className="container mx-auto px-4 py-16 pb-24 max-w-full">
          <div className="max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="text-center my-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-gray-800 dark:from-primary dark:to-gray-400 bg-clip-text text-transparent">
                Community Documentation
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Welcome to the Shinobi Open-Source Academy. Here&apos;s everything you need to know about our community guidelines and how to get started.
              </p>
            </div>

            {/* Code of Conduct */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-8 mb-12 w-full">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Code of Conduct
              </h2>
              
              <div className="prose prose-lg dark:prose-invert max-w-none w-full overflow-hidden">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The Shinobi Open-Source Academy is committed to providing a welcoming and inspiring community for all. We pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Our Standards</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Examples of behavior that contributes to creating a positive environment include:
                </p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Using welcoming and inclusive language</li>
                  <li>Being respectful of differing viewpoints and experiences</li>
                  <li>Gracefully accepting constructive criticism</li>
                  <li>Focusing on what is best for the community</li>
                  <li>Showing empathy towards other community members</li>
                  <li>Helping others learn and grow</li>
                  <li>Contributing meaningfully to open-source projects</li>
                </ul>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Unacceptable Behavior</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The following behaviors are considered harassment and are unacceptable within our community:
                </p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>The use of sexualized language or imagery and unwelcome sexual attention or advances</li>
                  <li>Trolling, insulting/derogatory comments, and personal or political attacks</li>
                  <li>Public or private harassment</li>
                  <li>Publishing others&apos; private information without explicit permission</li>
                  <li>Other conduct which could reasonably be considered inappropriate in a professional setting</li>
                </ul>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Community Responsibilities</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Community leaders are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Enforcement</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the community leaders. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances.
                </p>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <p className="text-primary font-medium">
                    <strong>Remember:</strong> This Code of Conduct applies both within project spaces and in public spaces when an individual is representing the project or its community.
                  </p>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-xl border border-primary/20 p-4 sm:p-8 mb-12 w-full">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Getting Started
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">For New Members</h3>
                  <ol className="list-decimal pl-6 space-y-3 text-gray-600 dark:text-gray-400">
                    <li>Join our community by selecting your preferred programming languages</li>
                    <li>Introduce yourself in the community channels</li>
                    <li>Explore our featured projects and find one that interests you</li>
                    <li>Start with &quot;good first issue&quot; labels on projects</li>
                    <li>Ask questions and seek help from mentors</li>
                    <li>Contribute regularly and build your portfolio</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">For Mentors</h3>
                  <ol className="list-decimal pl-6 space-y-3 text-gray-600 dark:text-gray-400">
                    <li>Apply to become a mentor through our application process</li>
                    <li>Share your expertise and guide new contributors</li>
                    <li>Review code and provide constructive feedback</li>
                    <li>Help maintain project quality and standards</li>
                    <li>Participate in community calls and discussions</li>
                    <li>Lead by example in open-source best practices</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Join CTA */}
            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-8 my-12 w-full">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Ready to Join Our Community?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Become part of the next generation of open-source warriors and start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="relative overflow-hidden px-8 py-4 rounded-lg font-semibold text-white bg-primary transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl"
                >
                  <span className="relative z-10">Join Us</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
                </button>
                <button
                  onClick={() => setIsMentorApplicationModalOpen(true)}
                  className="relative overflow-hidden px-8 py-4 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl"
                >
                  <span className="relative z-10">Apply as Mentor</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Modals */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
      <MentorApplicationModal
        isOpen={isMentorApplicationModalOpen}
        onClose={() => setIsMentorApplicationModalOpen(false)}
      />
    </div>
  );
}
