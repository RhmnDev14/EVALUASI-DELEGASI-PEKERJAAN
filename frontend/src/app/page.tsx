'use client';

import { useState, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    preview_url: string;
    download_url: string;
    data: any[];
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError("Harap pilih file dengan format CSV.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Harap pilih file dengan format CSV.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Terjadi kesalahan saat memproses data');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server. Pastikan API berjalan.');
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Evaluasi Delegasi Pekerjaan</h1>
        <p className={styles.description}>
          Sistem cerdas berbasis K-Means Clustering untuk menganalisis dan menyeimbangkan 
          distribusi beban kerja tim Anda.
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Upload Section */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Upload Data</h2>
          
          <div 
            className={styles.uploadArea}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.uploadIcon}>📁</div>
            <p className={styles.uploadText}>
              <span className={styles.uploadHighlight}>Klik untuk memilih</span> atau seret file ke sini
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Format: .csv</p>
            <input 
              type="file" 
              accept=".csv" 
              className={styles.fileInput} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          {error && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              ⚠️ {error}
            </div>
          )}

          {file && (
            <div className={styles.selectedFile}>
              <span className={styles.fileName}>{file.name}</span>
              <button onClick={(e) => { e.stopPropagation(); clearSelection(); }} className={styles.removeBtn}>✕</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <button 
              className={styles.button}
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? (
                <><div className={styles.spinner}></div> Memproses...</>
              ) : (
                '🚀 Analisis Data'
              )}
            </button>
            
            <a 
              href="http://127.0.0.1:8000/template" 
              target="_blank" 
              rel="noreferrer"
              className={`${styles.button} ${styles.secondaryBtn}`}
            >
              📄 Unduh Template CSV
            </a>
          </div>
        </section>

        {/* Result Section */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Hasil Analisis</h2>
          
          {result ? (
            <div className={styles.resultArea}>
              <div className={`${styles.alert} ${styles.alertSuccess}`}>
                ✅ {result.message}
              </div>
              
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Total Tugas</div>
                  <div className={styles.statValue}>{result.data.length}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Klaster Optimal</div>
                  <div className={styles.statValue}>3</div>
                </div>
              </div>

              <div className={styles.plotImage}>
                {/* Append timestamp to bypass browser cache if re-uploaded */}
                <img src={`${result.preview_url}?t=${new Date().getTime()}`} alt="Clustering Result Plot" />
              </div>

              <div className={styles.actions}>
                <a 
                  href={result.download_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className={styles.button}
                >
                  📥 Download Grafik (HD)
                </a>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <p>Belum ada data yang diproses.<br/>Silakan upload file CSV untuk melihat hasil K-Means Clustering.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
