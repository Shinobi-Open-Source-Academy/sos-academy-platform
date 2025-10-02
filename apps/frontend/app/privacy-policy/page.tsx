"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Navbar />
      <main className="pt-[var(--navbar-height)]">
        <div className="container mx-auto px-4 py-16 pb-24 max-w-full">
          <div className="max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="text-center my-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-gray-800 dark:from-primary dark:to-gray-400 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
            </div>

            {/* Privacy Policy Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-8 mb-12 w-full">
              <div className="prose prose-lg dark:prose-invert max-w-none w-full overflow-hidden">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Information We Collect</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We collect information you provide directly to us, such as when you:
                </p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Subscribe to our community</li>
                  <li>Apply to become a mentor</li>
                  <li>Contact us for support</li>
                  <li>Participate in our programs</li>
                </ul>

                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">How We Use Your Information</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Provide and maintain our services</li>
                  <li>Send you community updates and meeting invitations</li>
                  <li>Process mentor applications</li>
                  <li>Improve our platform and services</li>
                  <li>Communicate with you about your participation</li>
                </ul>

                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Information Sharing</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                </p>

                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Data Security</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Your Rights</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt out of communications</li>
                </ul>

                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Contact Us</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  If you have any questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:info@shinobiopensource.academy" className="text-primary hover:underline">
                    info@shinobiopensource.academy
                  </a>
                </p>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <p className="text-primary font-medium">
                    <strong>Note:</strong> This privacy policy may be updated from time to time. We will notify you of any changes by posting the new policy on this page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
