'use client';

import { useEffect, useRef, useState } from 'react';

interface QuickActionsMenuProps {
  onDelete?: () => void;
  onViewActivity?: () => void;
  githubUrl?: string;
}

export default function QuickActionsMenu({
  onDelete,
  onViewActivity,
  githubUrl,
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Quick actions menu"
      >
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <title>Actions menu</title>
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="py-1">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <span>🔗</span>
                Visit GitHub
              </a>
            )}
            {onViewActivity && (
              <button
                type="button"
                onClick={() => {
                  onViewActivity();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                <span>📊</span>
                View Activity
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
              >
                <span>🗑️</span>
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
