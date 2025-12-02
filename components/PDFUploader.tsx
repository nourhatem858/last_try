'use client';

import { useState } from 'react';

interface PDFUploadResult {
  success: boolean;
  text?: string;
  metadata?: {
    pages: number;
    wordCount: number;
    title: string;
    author: string;
    creationDate: string | null;
    producer: string;
  };
  error?: string;
}

export default function PDFUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PDFUploadResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.warn('⚠️ [PDFUploader | handleUpload] No file selected');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/pdf/extract', {
        method: 'POST',
        body: formData,
      });

      const data: PDFUploadResult = await response.json();

      if (data.success) {
        setResult(data);
        console.log('✅ [PDFUploader | handleUpload] PDF uploaded successfully', { 
          fileName: file.name,
          pages: data.metadata?.pages,
          wordCount: data.metadata?.wordCount 
        });
      } else {
        console.error('❌ [PDFUploader | handleUpload] Upload failed', { 
          fileName: file.name,
          error: data.error 
        });
        setResult({ success: false, error: data.error || 'Upload failed' });
      }
    } catch (error: any) {
      console.error('❌ [PDFUploader | handleUpload] Network error', { 
        fileName: file.name,
        error: error.message,
        stack: error.stack 
      });
      setResult({ success: false, error: error.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">PDF Text Extractor</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select PDF File
        </label>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
          hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors"
      >
        {loading ? 'Extracting...' : 'Extract Text'}
      </button>

      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Processing PDF...</p>
        </div>
      )}

      {result && !result.success && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-semibold">Error:</p>
          <p className="text-red-600">{result.error}</p>
        </div>
      )}

      {result && result.success && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-semibold mb-2">✅ Extraction Successful!</p>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Title:</strong> {result.metadata?.title}</p>
              <p><strong>Author:</strong> {result.metadata?.author}</p>
              <p><strong>Pages:</strong> {result.metadata?.pages}</p>
              <p><strong>Words:</strong> {result.metadata?.wordCount}</p>
              <p><strong>Producer:</strong> {result.metadata?.producer}</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="font-semibold mb-2">Extracted Text Preview:</p>
            <div className="max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {result.text?.substring(0, 2000)}
                {result.text && result.text.length > 2000 && '...'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
