import type { Metadata } from 'next';
import { CodeBackground } from '@sos-academy/ui';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import { SITE_CONFIG } from '../../lib/data';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE_CONFIG.fullName} collects, uses, and protects your personal data.`,
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = 'July 13, 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <CodeBackground />
      <Navbar />

      <section className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <div className="inline-block px-3 py-1 text-xs border border-white/10 text-gray-400 mb-6">
              LEGAL
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="space-y-12 text-gray-400 leading-relaxed font-light [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mb-4 [&_h2]:font-normal [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-emerald-400">
            <section>
              <h2>1. Introduction</h2>
              <p>
                {SITE_CONFIG.fullName} ("SOS Academy", "we", "us", or "our") operates{' '}
                <a href="https://shinobi-open-source.academy">shinobi-open-source.academy</a> and
                related community platforms. This policy explains what personal data we collect when
                you interact with our website, why we collect it, and how you can control it.
              </p>
              <p>
                By using our website or submitting a form on it, you agree to the collection and use
                of information as described in this policy.
              </p>
            </section>

            <section>
              <h2>2. Information We Collect</h2>
              <p>We collect information you provide directly to us, including:</p>
              <ul>
                <li>
                  <strong className="text-white">Joining the Academy</strong> — email address, name,
                  GitHub handle, and the communities you select when you sign up through our "Join
                  Academy" form.
                </li>
                <li>
                  <strong className="text-white">Mentor applications</strong> — email address, name,
                  GitHub handle, areas of expertise, and any additional information you share about
                  your motivation to mentor.
                </li>
                <li>
                  <strong className="text-white">Newsletter subscription</strong> — your email
                  address, if you choose to subscribe to updates.
                </li>
              </ul>
              <p>
                We also automatically collect limited, aggregated usage data (such as page views and
                general traffic patterns) through Vercel Analytics to help us understand how the
                website is used. This does not include cookies for tracking individuals across other
                websites.
              </p>
            </section>

            <section>
              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Create and manage your membership in SOS Academy communities</li>
                <li>Review and respond to mentor applications</li>
                <li>
                  Send community event invitations, weekly updates, and announcements — only if you
                  have opted in to receive them
                </li>
                <li>Match you with the right community and mentors</li>
                <li>Understand and improve how our website is used</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>
            </section>

            <section>
              <h2>4. How We Store and Share Information</h2>
              <p>
                Information submitted through our forms is sent securely to our backend systems and
                stored for as long as needed to operate the Academy and communities described above.
                We do not share your personal data with third parties except:
              </p>
              <ul>
                <li>
                  With service providers who help us operate the website (such as hosting and
                  analytics providers), under obligations to protect your data
                </li>
                <li>
                  When required by law or to protect the rights and safety of SOS Academy and our
                  community
                </li>
              </ul>
            </section>

            <section>
              <h2>5. The Hacker Platform</h2>
              <p>
                Some links on this website (such as "Start Hacking") take you to our separate member
                platform, where you sign in with your GitHub account. That platform has its own
                authentication flow governed by GitHub's own privacy practices for OAuth sign-in; we
                only receive the profile information GitHub shares with us to create and manage your
                account.
              </p>
            </section>

            <section>
              <h2>6. Your Choices</h2>
              <p>You can:</p>
              <ul>
                <li>Unsubscribe from emails at any time using the link in any message we send</li>
                <li>
                  Ask us to access, correct, or delete your personal data by contacting us at{' '}
                  <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
                </li>
              </ul>
            </section>

            <section>
              <h2>7. Children's Privacy</h2>
              <p>
                Our website is not directed at children under 13, and we do not knowingly collect
                personal information from children under 13.
              </p>
            </section>

            <section>
              <h2>8. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. If we make material changes, we will
                update the "Last updated" date above.
              </p>
            </section>

            <section>
              <h2>9. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or how we handle your data, reach
                out at <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
