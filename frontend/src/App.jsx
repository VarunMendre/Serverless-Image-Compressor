import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, Download, Loader2, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'https://nzsx2hp0gl.execute-api.ap-south-1.amazonaws.com'; // Production URL

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
      pollStatus(data.key);
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

        if (data.status === 'completed') {
          clearInterval(interval);
          setResult(data);
          setStatus('completed');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  return (
    <div className="container">
      <h1 className="title">ImageShrink</h1>
      <p className="subtitle">Premium Serverless Image Compression</p>

      <div className="glass-card">
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
            <Upload className="upload-icon" size={48} color="#818cf8" style={{ marginBottom: '1rem' }} />
            <h3>Drag & Drop your image</h3>
            <p>or click to browse from files</p>
          </div>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <div className="status-container">
            <Loader2 className="loading-icon" size={48} color="#818cf8" />
            <h3 style={{ marginTop: '1.5rem' }}>
              {status === 'uploading' ? 'Uploading...' : 'Processing & Compressing...'}
            </h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: status === 'uploading' ? '40%' : '75%' }}></div>
            </div>
          </div>
        )}

        {status === 'completed' && result && (
          <div className="result-container">
            <CheckCircle size={48} color="#10b981" />
            <h3 style={{ margin: '1rem 0' }}>Ready for Download!</h3>
            
            <div className="preview-box" style={{ margin: '2rem 0', borderRadius: '12px', overflow: 'hidden' }}>
              <img 
                src={result.url || result.s3Url} 
                alt="Compressed" 
                style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', margin: '0 auto' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="button" onClick={() => window.open(result.url || result.s3Url, '_blank')}>
                <ImageIcon size={20} /> Preview
              </button>
              <a href={result.url || result.s3Url} download className="button">
                <Download size={20} /> Download
              </a>
            </div>
            
            <button 
              className="button" 
              style={{ marginTop: '2rem', background: 'transparent', border: '1px solid #475569' }}
              onClick={() => { setStatus('idle'); setFile(null); setResult(null); }}
            >
              Upload Another
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="error-container">
            <AlertCircle size={48} color="#ef4444" />
            <h3 style={{ margin: '1rem 0' }}>Something went wrong</h3>
            <p className="error-text">{error}</p>
            <button className="button" style={{ marginTop: '1rem' }} onClick={() => setStatus('idle')}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
