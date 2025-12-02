'use client';

/**
 * AI Summarize Button Component
 * Beautiful button with modal for AI document summarization
 */

import { useState } from 'react';
import { SparklesIcon, XMarkIcon, DocumentTextIcon, ClipboardDocumentIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface AISummarizeButtonProps {
  documentId?: string;
  title: string;
  content: string;
  onSummaryGenerated?: (summary: any) => void;
}

export default function AISummarizeButton({
  documentId,
  title,
  content,
  onSummaryGenerated,
}: AISummarizeButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          documentId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSummary(data.data);
        onSummaryGenerated?.(data.data);
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = `Summary: ${summary.summary}\n\nKey Points:\n${summary.keyPoints.join('\n')}\n\nTopics: ${summary.topics.join(', ')}`;
    navigator.clipboard.writeText(text);
    console.log('✅ [AISummarizeButton | handleCopy] Summary copied to clipboard', { 
      documentId,
      textLength: text.length 
    });
  };

  const handleDownload = () => {
    const text = `AI Summary - ${title}\n\n${summary.summary}\n\nKey Points:\n${summary.keyPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}\n\nTopics: ${summary.topics.join(', ')}\n\nSentiment: ${summary.sentiment}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* AI Summarize Button */}
      <button
        onClick={() => {
          setShowModal(true);
          if (!summary) handleSummarize();
        }}
        className="
          flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
          bg-gradient-to-r from-purple-500 to-pink-600
          text-white shadow-lg shadow-purple-500/30
          hover:shadow-purple-500/50 hover:scale-105
          transition-all duration-200
        "
      >
        <SparklesIcon className="w-5 h-5" />
        <span>✨ AI Summarize</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-gradient-to-br from-[#0D1B2A] to-black border border-purple-500/30 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Summary</h2>
                  <p className="text-sm text-gray-400">{title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-gray-400">Generating AI summary...</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {summary && !loading && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-bold text-white">Summary</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{summary.summary}</p>
                  </div>

                  {/* Key Points */}
                  <div className="p-6 bg-black/40 border border-purple-500/20 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Key Points</h3>
                    <ul className="space-y-3">
                      {summary.keyPoints.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="text-gray-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Topics & Sentiment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-black/40 border border-purple-500/20 rounded-xl">
                      <h4 className="text-sm font-bold text-white mb-3">Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {summary.topics.map((topic: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-sm border border-purple-500/20"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-black/40 border border-purple-500/20 rounded-xl">
                      <h4 className="text-sm font-bold text-white mb-3">Sentiment</h4>
                      <span
                        className={`inline-flex px-4 py-2 rounded-lg font-semibold ${
                          summary.sentiment === 'positive'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : summary.sentiment === 'negative'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}
                      >
                        {summary.sentiment.charAt(0).toUpperCase() + summary.sentiment.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {summary && !loading && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-purple-500/20">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-purple-500/20 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  <ClipboardDocumentIcon className="w-5 h-5" />
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
