"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SubscriptionModal from "../components/SubscriptionModal";
import MentorApplicationModal from "../components/MentorApplicationModal";

export default function Blog() {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isMentorApplicationModalOpen, setIsMentorApplicationModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Navbar />
      <main className="pt-[var(--navbar-height)]">
        <div className="container mx-auto px-4 py-16 pb-24 max-w-full">
          <div className="max-w-4xl mx-auto text-center w-full">
            {/* Header */}
            <div className="my-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-gray-800 dark:from-primary dark:to-gray-400 bg-clip-text text-transparent">
                Blog
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Insights, tutorials, and stories from the open-source community
              </p>
            </div>

            {/* Coming Soon Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-12 mb-12 w-full">
              <div className="max-w-2xl mx-auto">
                {/* Blurred Background Effect */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-lg blur-xl"></div>
                  <div className="relative bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-lg p-8 border border-primary/20">
                    <div className="text-6xl mb-4 opacity-30">📝</div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                      Coming Soon
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                      We&apos;re working hard to bring you amazing content about open-source development, community insights, and success stories from our members.
                    </p>
                  </div>
                </div>

                {/* What to Expect */}
                <div className="text-left">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                    What You Can Expect
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Technical Tutorials</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Step-by-step guides for contributing to open-source projects</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Community Stories</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Success stories and experiences from our community members</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Best Practices</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Tips and tricks for effective open-source collaboration</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Project Spotlights</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Deep dives into interesting open-source projects</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Industry Insights</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Trends and analysis in the open-source ecosystem</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Mentor Interviews</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Conversations with our expert mentors</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stay Updated */}
                <div className="mt-12 p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-lg w-full">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Stay Updated
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Join our community to be the first to know when we publish new content.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setIsSubscriptionModalOpen(true)}
                      className="relative overflow-hidden px-6 py-3 rounded-lg font-medium text-white bg-primary transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl"
                    >
                      <span className="relative z-10">Join Us</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
                    </button>
                    <button
                      onClick={() => setIsMentorApplicationModalOpen(true)}
                      className="relative overflow-hidden px-6 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl"
                    >
                      <span className="relative z-10">Apply as Mentor</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
                    </button>
                  </div>
                </div>
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
