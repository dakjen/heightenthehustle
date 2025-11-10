'use client';

import React, { useState } from 'react';

interface SyllabusUploadInputProps {
  onUploadSuccess: (url: string) => void;
  initialUrl?: string | null;
}

export default function SyllabusUploadInput({ onUploadSuccess, initialUrl }: SyllabusUploadInputProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialUrl || null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/upload/file?filename=${file.name}`,
        {
          method: 'POST',
          body: file,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const newBlob = await response.json();
      setUploadedUrl(newBlob.url);
      onUploadSuccess(newBlob.url);
    } catch (err: unknown) {
      console.error('Error uploading syllabus:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to upload file.');
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={uploading} />
      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
        className="ml-2 inline-flex justify-center py-1 px-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {uploading ? 'Uploading...' : 'Upload Syllabus'}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {uploadedUrl && (
        <p className="text-green-600 text-sm mt-1">
          Syllabus uploaded: <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="underline">{uploadedUrl}</a>
        </p>
      )}
      {/* Hidden input to pass the URL to the server action form */}
      <input type="hidden" name="syllabusUrl" value={uploadedUrl || ''} />
    </div>
  );
}