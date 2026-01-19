'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface QuickActionsMenuProps {
  onDelete?: () => void;
  onViewDetails?: () => void;
  email?: string;
}

export default function QuickActionsMenu({
  onDelete,
  onViewDetails,
  email,
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.right - 144, // menu width is w-36 = 144px
      });
    }
  }, [isOpen]);

  const menu = isOpen ? (
    <>
      <div
        className="fixed inset-0 z-[9999]"
        onClick={() => setIsOpen(false)}
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen(false)}
      />
      <div
        className="fixed z-[10000] w-36 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg py-1"
        style={{ top: coords.top, left: coords.left }}
      >
        {onViewDetails && (
          <button
            type="button"
            onClick={() => {
              onViewDetails();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <title>View</title>
              <circle cx="12" cy="12" r="3" />
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            </svg>
            View
          </button>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <title>Email</title>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
            Email
          </a>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <title>Delete</title>
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
            </svg>
            Delete
          </button>
        )}
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded transition-colors"
      >
        <svg className="w-5 h-5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
          <title>Quick Actions</title>
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {typeof document !== 'undefined' && createPortal(menu, document.body)}
    </>
  );
}
