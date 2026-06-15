'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon, CheckIcon, CopyIcon, DownloadIcon, WhatsAppIcon } from '../icons';
import { COPY_FEEDBACK_DURATION_MS } from './constants';
import type { ShareButtonsProps } from './types';

export function ShareButtons({
  title,
  description,
  startTime,
  endTime,
  meetingLink,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!showCalendar) return;

    const handleClickOutside = () => setShowCalendar(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showCalendar]);

  const getShareText = () => {
    const date = new Date(startTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    let text = `🥷 *${title}*\n📅 ${date}`;
    if (description) {
      text += `\n\n${description}`;
    }
    if (meetingLink) {
      text += `\n\n🔗 Join here: ${meetingLink}`;
    }
    text += '\n\n— Shinobi Open-Source Academy';
    return text;
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyLink = async () => {
    if (!meetingLink) return;
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getGoogleCalendarUrl = () => {
    const start = new Date(startTime).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(endTime).toISOString().replace(/-|:|\.\d+/g, '');

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', title);
    url.searchParams.append('dates', `${start}/${end}`);
    if (description) url.searchParams.append('details', description);
    if (meetingLink) url.searchParams.append('location', meetingLink);

    return url.toString();
  };

  const downloadIcs = () => {
    const start = new Date(startTime).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(endTime).toISOString().replace(/-|:|\.\d+/g, '');

    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      description ? `DESCRIPTION:${description}` : '',
      meetingLink ? `LOCATION:${meetingLink}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-2 relative">
      <button
        type="button"
        onClick={shareOnWhatsApp}
        className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-500/10 rounded transition-colors"
        title="Share on WhatsApp"
      >
        <WhatsAppIcon className="w-4 h-4" />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowCalendar(!showCalendar);
          }}
          className={`p-2 rounded transition-colors ${showCalendar ? 'text-white bg-white/10' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
          title="Add to Calendar"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>

        {showCalendar && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 z-50 animate-[fadeIn_0.1s_ease-out] backdrop-blur-xl">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <title>Google Calendar</title>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google Calendar
            </a>
            <button
              type="button"
              onClick={downloadIcs}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
            >
              <DownloadIcon />
              Download .ICS
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={copyLink}
        className={`p-2 rounded transition-colors ${copied ? 'text-green-500 bg-green-500/10' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
      </button>
    </div>
  );
}
