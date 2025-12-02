'use client';

/**
 * Invite Member Modal Component
 * Modal for inviting new members to workspace
 */

import { useState } from 'react';
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: { email: string; role: string }) => Promise<void>;
}

export default function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      value: 'admin',
      label: 'Admin',
      description: 'Can manage members and settings',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      value: 'editor',
      label: 'Editor',
      description: 'Can create and edit content',
      color: 'from-green-500 to-emerald-600',
    },
    {
      value: 'viewer',
      label: 'Viewer',
      description: 'Can only view content',
      color: 'from-orange-500 to-red-600',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await onInvite(formData);
      setFormData({ email: '', role: 'viewer' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <UserPlusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Invite Member</h2>
              <p className="text-sm text-gray-400">Add someone to your workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="colleague@example.com"
              className="
                w-full px-4 py-3 rounded-lg
                bg-black/40 border border-cyan-500/20
                text-white placeholder-gray-500
                focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                transition-all duration-200
              "
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Role *
            </label>
            <div className="space-y-3">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg cursor-pointer
                    border transition-all duration-200
                    ${
                      formData.role === role.value
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-cyan-500/20 bg-black/40 hover:border-cyan-500/30 hover:bg-black/60'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 w-4 h-4 text-cyan-500 border-gray-300 focus:ring-cyan-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`
                          px-2 py-0.5 rounded text-xs font-semibold
                          bg-gradient-to-r ${role.color} text-white
                        `}
                      >
                        {role.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <p className="text-sm text-cyan-400">
              💡 An invitation email will be sent to the member with instructions to join.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 px-6 py-3 rounded-lg font-semibold
                bg-white/5 border border-cyan-500/20 text-white
                hover:bg-white/10 transition-all duration-200
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="
                flex-1 px-6 py-3 rounded-lg font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white shadow-lg shadow-cyan-500/30
                hover:shadow-cyan-500/50 hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                transition-all duration-200
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
