'use client';

/**
 * Quick Actions Panel Component
 * Fully functional quick action buttons with API integration
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/contexts/NotesProvider';
import { useDocuments } from '@/contexts/DocumentsProvider';
import { useWorkspaces } from '@/contexts/WorkspacesProvider';
import { useAI } from '@/contexts/AIProvider';
import {
  PlusCircleIcon,
  DocumentPlusIcon,
  FolderPlusIcon,
  ChatBubbleLeftIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import CreateNoteModal from '@/components/notes/CreateNoteModal';
import UploadDocumentModal from '@/components/documents/UploadDocumentModal';
import CreateWorkspaceModal from '@/components/workspaces/CreateWorkspaceModal';
import QuickAddModal from '@/components/dashboard/QuickAddModal';

interface QuickActionsProps {
  onActivityUpdate?: () => void;
}

export default function QuickActionsPanel({ onActivityUpdate }: QuickActionsProps) {
  const router = useRouter();
  const { token } = useAuth();
  const { addNote } = useNotes();
  const { addDocument } = useDocuments();
  const { addWorkspace } = useWorkspaces();
  const { createConversation } = useAI();

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleCreateNote = async (data: { title: string; content: string; tags: string[]; color: string }) => {
    try {
      setLoading('note');
      setError('');

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create note');

      const result = await response.json();
      addNote(result.data);
      setShowNoteModal(false);
      onActivityUpdate?.();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(null);
    }
  };

  const handleUploadDocument = async (data: any) => {
    try {
      setLoading('document');
      setError('');

      // Create FormData for file upload
      const formData = new FormData();
      if (data.file) {
        formData.append('file', data.file);
      }
      formData.append('title', data.title);
      formData.append('tags', JSON.stringify(data.tags || []));
      if (data.description) {
        formData.append('description', data.description);
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }

      const result = await response.json();
      addDocument(result.data);
      setShowDocumentModal(false);
      onActivityUpdate?.();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(null);
    }
  };

  const handleCreateWorkspace = async (data: { name: string; description: string; color: string }) => {
    try {
      setLoading('workspace');
      setError('');

      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create workspace');

      const result = await response.json();
      addWorkspace(result.data);
      setShowWorkspaceModal(false);
      onActivityUpdate?.();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(null);
    }
  };

  const handleStartChat = () => {
    const conversation = createConversation('New AI Conversation');
    router.push('/ai-assistance');
  };

  const handleAskAI = () => {
    router.push('/ai-assistance');
  };

  const actions = [
    {
      name: 'Create Note',
      description: 'Start a new note',
      icon: DocumentPlusIcon,
      gradient: 'from-cyan-500 to-blue-600',
      action: () => setShowNoteModal(true),
      loading: loading === 'note',
    },
    {
      name: 'Upload Document',
      description: 'Add files to workspace',
      icon: ArrowUpTrayIcon,
      gradient: 'from-purple-500 to-pink-600',
      action: () => setShowDocumentModal(true),
      loading: loading === 'document',
    },
    {
      name: 'New Workspace',
      description: 'Create a workspace',
      icon: FolderPlusIcon,
      gradient: 'from-green-500 to-emerald-600',
      action: () => setShowWorkspaceModal(true),
      loading: loading === 'workspace',
    },
    {
      name: 'Start Chat',
      description: 'Begin AI conversation',
      icon: ChatBubbleLeftIcon,
      gradient: 'from-orange-500 to-red-600',
      action: handleStartChat,
      loading: false,
    },
    {
      name: 'Ask AI',
      description: 'Get instant answers',
      icon: SparklesIcon,
      gradient: 'from-yellow-500 to-orange-600',
      action: handleAskAI,
      loading: false,
    },
    {
      name: 'Quick Add',
      description: 'Add anything quickly',
      icon: PlusCircleIcon,
      gradient: 'from-blue-500 to-indigo-600',
      action: () => setShowQuickAddModal(true),
      loading: false,
    },
  ];

  return (
    <>
      <div className="bg-gradient-to-br from-[#0D1B2A] to-black border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            <p className="text-sm text-gray-400 mt-1">Get started with common tasks</p>
          </div>
          <SparklesIcon className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.name}
                onClick={action.action}
                disabled={action.loading}
                className="
                  group relative bg-black/40 border border-cyan-500/20
                  rounded-xl p-5 text-left
                  hover:border-cyan-500/40 hover:bg-black/60
                  hover:shadow-xl hover:shadow-cyan-500/10
                  transition-all duration-300 overflow-hidden
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {/* Glowing background */}
                <div
                  className={`
                    absolute inset-0 bg-gradient-to-br ${action.gradient}
                    opacity-0 group-hover:opacity-10 transition-opacity duration-300
                  `}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div
                    className={`
                      w-12 h-12 rounded-lg bg-gradient-to-br ${action.gradient}
                      flex items-center justify-center mb-3
                      shadow-lg group-hover:shadow-xl group-hover:scale-110
                      transition-all duration-300
                    `}
                  >
                    {action.loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    {action.description}
                  </p>
                </div>

                {/* Hover shine effect */}
                <div
                  className="
                    absolute inset-0 opacity-0 group-hover:opacity-100
                    bg-gradient-to-r from-transparent via-white/5 to-transparent
                    -translate-x-full group-hover:translate-x-full
                    transition-all duration-700
                  "
                />

                {/* Arrow indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg
                    className="w-5 h-5 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showNoteModal && (
        <CreateNoteModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          onCreate={handleCreateNote}
        />
      )}

      {showDocumentModal && (
        <UploadDocumentModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          onUpload={handleUploadDocument}
        />
      )}

      {showWorkspaceModal && (
        <CreateWorkspaceModal
          isOpen={showWorkspaceModal}
          onClose={() => setShowWorkspaceModal(false)}
          onCreate={handleCreateWorkspace}
        />
      )}

      {showQuickAddModal && (
        <QuickAddModal
          isOpen={showQuickAddModal}
          onClose={() => setShowQuickAddModal(false)}
          onCreateNote={handleCreateNote}
          onUploadDocument={handleUploadDocument}
          onCreateWorkspace={handleCreateWorkspace}
          onActivityUpdate={onActivityUpdate}
        />
      )}
    </>
  );
}
