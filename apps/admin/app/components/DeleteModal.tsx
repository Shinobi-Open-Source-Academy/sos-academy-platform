'use client';

import { useState } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, userName }: DeleteModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Delete User</h3>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete <span className="font-semibold">{userName}</span>?
        </p>

        <div className="mb-4">
          <label htmlFor="delete-reason" className="block text-sm font-medium text-gray-300 mb-2">
            Reason (will be sent via email)
          </label>
          <textarea
            id="delete-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
            placeholder="Please provide a reason for deletion..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
