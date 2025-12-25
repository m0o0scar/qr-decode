'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: string;
    error?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/decode', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to decode QR code',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black py-12 px-4">
      <main className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <Image
            className="mx-auto mb-4 dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={24}
            priority
          />
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            QR Code Decoder
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Upload an image containing a QR code to decode it
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Input */}
            <div>
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                         border-zinc-300 dark:border-zinc-600
                         hover:border-zinc-400 dark:hover:border-zinc-500
                         bg-zinc-50 dark:bg-zinc-900"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {previewUrl ? (
                    <div className="relative w-full h-48 flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-48 max-w-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-12 h-12 mb-3 text-zinc-400 dark:text-zinc-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        PNG, JPG, GIF, WebP
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              {selectedFile && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 
                         py-3 px-6 rounded-lg font-medium
                         hover:bg-zinc-700 dark:hover:bg-zinc-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              >
                {loading ? 'Decoding...' : 'Decode QR Code'}
              </button>
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100
                           py-3 px-6 rounded-lg font-medium
                           hover:bg-zinc-300 dark:hover:bg-zinc-600
                           transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {/* Result Display */}
          {result && (
            <div className="mt-6 p-6 rounded-xl border-2 animate-in fade-in duration-300"
                 style={{
                   borderColor: result.success ? '#22c55e' : '#ef4444',
                   backgroundColor: result.success 
                     ? 'rgba(34, 197, 94, 0.1)' 
                     : 'rgba(239, 68, 68, 0.1)'
                 }}>
              <h3 className="font-semibold mb-2 text-lg"
                  style={{ color: result.success ? '#16a34a' : '#dc2626' }}>
                {result.success ? '✓ QR Code Decoded' : '✗ Decoding Failed'}
              </h3>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg">
                <p className="font-mono text-sm break-all text-zinc-900 dark:text-zinc-100">
                  {result.success ? result.data : result.error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            API Endpoint: <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">/api/decode</code>
          </p>
          <p className="mt-2">
            Upload any image containing a QR code to see the decoded content
          </p>
        </div>
      </main>
    </div>
  );
}
