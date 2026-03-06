import React, { useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, Download, Loader2, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, etc.)');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      handleUpload(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (fileToUpload) => {
    setStatus('uploading');
    const formData = new FormData();
    formData.append('image', fileToUpload);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      if (data.success && data.data && data.data.key) {
        pollStatus(data.data.key);
      } else {
        throw new Error(data.message || 'Upload failed: Unexpected response structure');
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const pollStatus = async (key) => {
    setStatus('processing');
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/status/${key}`);
        const data = await response.json();

        if (data.success && data.data && data.data.status === 'completed') {
          clearInterval(interval);
          setResult(data.data);
          setStatus('completed');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'compressed-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="container">
      <h1 className="title">ImageShrink</h1>
      <p className="subtitle">Serverless Image Compression</p>

      <div className="glass-card">

        {/* ── Idle: Dropzone ── */}
        {status === 'idle' && (
          <div
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              type="file"
              id="file-input"
              hidden
              onChange={handleFileChange}
              accept="image/*"
            />
            <Upload
              className="upload-icon"
              size={52}
              style={{ marginBottom: '1.25rem' }}
            />
            <h3>Drag &amp; Drop your image</h3>
            <p>or click to browse from files</p>
          </div>
        )}

        {/* ── Uploading / Processing ── */}
        {(status === 'uploading' || status === 'processing') && (
          <div className="status-container">
            <Loader2 className="loading-icon" size={52} />
            <h3>
              {status === 'uploading' ? 'Uploading...' : 'Processing & Compressing...'}
            </h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: status === 'uploading' ? '40%' : '75%' }}
              />
            </div>
          </div>
        )}

        {/* ── Completed ── */}
        {status === 'completed' && result && (
          <div className="result-container">
            <CheckCircle size={52} color="var(--nb-green)" strokeWidth={3} />
            <h3>Ready for Download!</h3>

            <div className="preview-box">
              <img
                src={result.url || result.s3Url}
                alt="Compressed"
                style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', margin: '0 auto' }}
              />
            </div>

            <div className="button-row">
              <button
                className="button"
                onClick={() => window.open(result.url || result.s3Url, '_blank')}
              >
                <ImageIcon size={18} /> Preview
              </button>
              <button
                className="button"
                onClick={() =>
                  handleDownload(
                    result.downloadUrl || result.url,
                    result.key || 'compressed-image.png'
                  )
                }
              >
                <Download size={18} /> Download
              </button>
            </div>

            <button
              className="button button-ghost"
              style={{ marginTop: '1.5rem' }}
              onClick={() => { setStatus('idle'); setFile(null); setResult(null); }}
            >
              Upload Another
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {status === 'error' && (
          <div className="error-container">
            <AlertCircle size={52} />
            <h3>Something went wrong</h3>
            <p className="error-text">{error}</p>
            <button className="button" style={{ marginTop: '0.75rem' }} onClick={() => setStatus('idle')}>
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
