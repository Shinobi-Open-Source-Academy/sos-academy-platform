'use client';

import BeakerIcon from './icons/BeakerIcon';
import BookIcon from './icons/BookIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import DevicePhoneIcon from './icons/DevicePhoneIcon';
import UsersIcon from './icons/UsersIcon';
import VideoIcon from './icons/VideoIcon';

export default function About() {
  return (
    <section id="about" className="section pt-20 pb-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-gray-800 dark:from-primary dark:to-gray-400 bg-clip-text text-transparent">
            Bring your backlog.
            <br />
            We&apos;ll handle the rest.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Our mission is to train, empower, and nurture a community of developers who not only
            contribute to open-source projects but also lead and innovate within it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-5px]">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <BookIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2">Training & Skill Development</h3>
            <p className="text-gray-600 dark:text-gray-400">
              In-depth training on contributing to open-source, from finding issues and forking
              repos to submitting pull requests.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-5px]">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UsersIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mentorship & Communities</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Join sub-communities led by experienced mentors who will guide you through the
              open-source journey.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-5px]">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <BeakerIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-World Projects</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Work on internal open-source projects with commercial potential and earn rewards for
              your contributions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-5px]">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CurrencyDollarIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2">Paid Opportunities</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get connected with organizations looking for open-source contributors and receive
              compensation for your work.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-5px]">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <VideoIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2">Weekly Calls & Podcasts</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Engage in regular community calls and listen to monthly podcasts featuring insights
              from our mentors.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-5px]">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <DevicePhoneIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2">Inclusive Environment</h3>
            <p className="text-gray-600 dark:text-gray-400">
              A welcoming space for developers of all backgrounds and experience levels to learn and
              contribute.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
