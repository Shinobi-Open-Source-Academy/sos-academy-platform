'use client';

import { useEffect, useRef, useState } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, userName }: DeleteModalProps) {
  const [reason, setReason] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 animate-fade-in">
        <div className="card p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 flex items-center justify-center border border-red-500/30 bg-red-500/10">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Delete User</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Are you sure you want to delete{' '}
                <span className="text-white font-medium">{userName}</span>? This action cannot be
                undone.
              </p>
            </div>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label htmlFor="delete-reason" className="block text-sm font-medium text-zinc-300 mb-2">
              Reason
              <span className="text-zinc-600 font-normal ml-1">(will be sent via email)</span>
            </label>
            <textarea
              ref={inputRef}
              id="delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="Please provide a reason for deletion..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!reason.trim()}
              className="btn-danger flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
