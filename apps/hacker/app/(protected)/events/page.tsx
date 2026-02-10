'use client';
import { ComingSoon } from '../../../components/ComingSoon';
import Sidebar from '../../../components/Sidebar';

const mockEvents = [
  {
    id: 1,
    title: 'Weekly Konoha Standup',
    date: '2026-01-07',
    time: '19:00 UTC',
    type: 'standup',
    community: 'Konoha',
    attending: true,
  },
  {
    id: 2,
    title: 'Code Review Session',
    date: '2026-01-09',
    time: '18:00 UTC',
    type: 'workshop',
    community: 'All',
    attending: true,
  },
  {
    id: 3,
    title: 'Monthly All Hands',
    date: '2026-01-15',
    time: '17:00 UTC',
    type: 'meeting',
    community: 'All',
    attending: false,
  },
  {
    id: 4,
    title: 'TypeScript Deep Dive',
    date: '2026-01-20',
    time: '19:00 UTC',
    type: 'workshop',
    community: 'Konoha',
    attending: false,
  },
  {
    id: 5,
    title: 'Open Source Friday',
    date: '2026-01-24',
    time: '16:00 UTC',
    type: 'hackathon',
    community: 'All',
    attending: false,
  },
];

export default function EventsPage() {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return { month: date.toLocaleString('en-US', { month: 'short' }), day: date.getDate() };
  };

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl font-semibold text-white">Events</h1>
            <p className="text-zinc-500 text-sm mt-1">Upcoming community events and meetings</p>
          </div>

          <ComingSoon>
            <div className="space-y-3 animate-fade-in delay-150">
              {mockEvents.map((event) => {
                const { month, day } = formatDate(event.date);
                return (
                  <div key={event.id} className="card p-5 flex items-center gap-5">
                    <div className="event-date">
                      <span className="text-xs font-medium">{month}</span>
                      <span className="text-xl font-semibold">{day}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{event.title}</h3>
                        {event.attending && (
                          <span className="badge badge-success text-[10px]">Attending</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {event.time} · {event.community} · {event.type}
                      </p>
                    </div>
                    <span
                      className={event.attending ? 'btn-secondary text-xs' : 'btn-primary text-xs'}
                    >
                      {event.attending ? 'Cancel RSVP' : 'RSVP'}
                    </span>
                  </div>
                );
              })}
            </div>
          </ComingSoon>
        </div>
      </main>
    </div>
  );
}
