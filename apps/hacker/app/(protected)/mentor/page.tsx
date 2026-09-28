'use client';

import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';

const upcomingTools = [
  {
    title: 'My Squad',
    description: 'See the mentees in your squad, their GitHub handle and when they joined.',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    title: 'Mentee Progress',
    description: "Follow each mentee's assigned and merged issues, and spot who is stuck.",
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
  {
    title: 'Mentor Notes',
    description: 'Keep private notes on how each mentee is doing between sessions.',
    icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
  },
];

export default function MentorHomePage() {
  return (
    <div className="min-h-screen bg-black md:flex">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <span className="badge badge-success text-[10px] mb-3">Sensei</span>
            <h1 className="text-2xl font-semibold text-white">Mentor Space</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Guide your squad and follow your mentees' progress.
            </p>
          </div>

          <Link
            href="/mentor/profile"
            className="card p-5 mb-8 flex items-center gap-4 group animate-fade-in delay-75 hover:border-emerald-500/30"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-medium">Edit your public profile</h2>
              <p className="text-sm text-zinc-500 mt-0.5">
                Title, description and links shown on the mentor directory.
              </p>
            </div>
            <span
              className="text-zinc-500 group-hover:text-emerald-400 transition-colors"
              aria-hidden="true"
            >
              →
            </span>
          </Link>

          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Coming soon
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in delay-150">
            {upcomingTools.map((tool) => (
              <div key={tool.title} className="card p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
                    </svg>
                  </div>
                  <span className="badge badge-neutral text-[10px]">Coming soon</span>
                </div>
                <h3 className="text-white font-medium mt-4">{tool.title}</h3>
                <p className="text-sm text-zinc-500 mt-1">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
