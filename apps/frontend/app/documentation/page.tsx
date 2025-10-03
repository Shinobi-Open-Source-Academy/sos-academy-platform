'use client';

import { useState } from 'react';
import Footer from '../components/Footer';
import MentorApplicationModal from '../components/MentorApplicationModal';
import Navbar from '../components/Navbar';
import SubscriptionModal from '../components/SubscriptionModal';
import { DOCUMENTATION_DATA } from '../data/siteData';

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
                {DOCUMENTATION_DATA.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {DOCUMENTATION_DATA.subtitle}
              </p>
            </div>

            {/* Code of Conduct */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-8 mb-12 w-full">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                {DOCUMENTATION_DATA.codeOfConduct.title}
              </h2>

              <div className="prose prose-lg dark:prose-invert max-w-none w-full overflow-hidden">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {DOCUMENTATION_DATA.codeOfConduct.description}
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {DOCUMENTATION_DATA.codeOfConduct.standards.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {DOCUMENTATION_DATA.codeOfConduct.standards.description}
                </p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-400 space-y-2">
                  {DOCUMENTATION_DATA.codeOfConduct.standards.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {DOCUMENTATION_DATA.codeOfConduct.unacceptableBehavior.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {DOCUMENTATION_DATA.codeOfConduct.unacceptableBehavior.description}
                </p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-400 space-y-2">
                  {DOCUMENTATION_DATA.codeOfConduct.unacceptableBehavior.items.map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {DOCUMENTATION_DATA.codeOfConduct.responsibilities.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {DOCUMENTATION_DATA.codeOfConduct.responsibilities.description}
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {DOCUMENTATION_DATA.codeOfConduct.enforcement.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {DOCUMENTATION_DATA.codeOfConduct.enforcement.description}
                </p>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <p className="text-primary font-medium">
                    <strong>Remember:</strong> {DOCUMENTATION_DATA.codeOfConduct.reminder}
                  </p>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-xl border border-primary/20 p-4 sm:p-8 mb-12 w-full">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                {DOCUMENTATION_DATA.gettingStarted.title}
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {DOCUMENTATION_DATA.gettingStarted.newMembers.title}
                  </h3>
                  <ol className="list-decimal pl-6 space-y-3 text-gray-600 dark:text-gray-400">
                    {DOCUMENTATION_DATA.gettingStarted.newMembers.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {DOCUMENTATION_DATA.gettingStarted.mentors.title}
                  </h3>
                  <ol className="list-decimal pl-6 space-y-3 text-gray-600 dark:text-gray-400">
                    {DOCUMENTATION_DATA.gettingStarted.mentors.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Join CTA */}
            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-8 my-12 w-full">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {DOCUMENTATION_DATA.cta.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {DOCUMENTATION_DATA.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="relative overflow-hidden px-8 py-4 rounded-lg font-semibold text-white bg-primary transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl"
                >
                  <span className="relative z-10">{DOCUMENTATION_DATA.cta.joinButtonText}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out blur-sm z-0" />
                </button>
                <button
                  onClick={() => setIsMentorApplicationModalOpen(true)}
                  className="relative overflow-hidden px-8 py-4 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 transition-all duration-300 ease-in-out transform group hover:scale-105 hover:shadow-xl"
                >
                  <span className="relative z-10">{DOCUMENTATION_DATA.cta.mentorButtonText}</span>
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
