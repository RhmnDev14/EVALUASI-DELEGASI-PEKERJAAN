'use client';

import { useState, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{status: string, message: string} | null>(null);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{
    status: string;
    message: string;
    davies_bouldin_index: number;
    cluster_summary: any[];
    role_analysis: any[];
    assignee_analysis: any[];
    role_workload: any[];
    assignee_workload: any[];
    elbow_method: {
      k_values: number[];
      inertia: number[];
    };
    preview_url: string;
    download_url: string;
    excel_url: string;
    data: any[];
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

  const handleDryRun = async () => {
    if (!file) return;

    setValidating(true);
    setError(null);
    setValidationResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/dry-run', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Terjadi kesalahan saat memvalidasi data');
      }

      setValidationResult(data);
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server. Pastikan API berjalan.');
    } finally {
      setValidating(false);
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
    setValidationResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getInterpretationBadge = (interpretation: string) => {
    if (interpretation === 'Tinggi') return styles.badgeDanger;
    if (interpretation === 'Sedang') return styles.badgeWarning;
    if (interpretation === 'Rendah') return styles.badgeSuccess;
    return styles.badgePrimary;
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pengelompokan Beban Kerja Karyawan</h1>
        <p className={styles.description}>
          Analisis pemerataan beban kerja tim berdasarkan pendekatan <strong>K-Means Clustering</strong> pada atribut History Point.
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Upload Section */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Upload Dataset</h2>
          
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
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Format: .csv (Wajib: assignee, story_point, dll)</p>
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

          {validationResult && (
            <div className={`${styles.alert} ${styles.alertSuccess}`} style={{ marginBottom: '1rem' }}>
              ✅ {validationResult.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className={`${styles.button} ${styles.secondaryBtn}`}
                onClick={handleDryRun}
                disabled={!file || validating || loading}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                {validating ? (
                  <><div className={styles.spinner}></div> Memvalidasi...</>
                ) : (
                  '🔍 Validasi (Dry Run)'
                )}
              </button>
              <button 
                className={styles.button}
                onClick={handleUpload}
                disabled={!file || loading || validating}
                style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                {loading ? (
                  <><div className={styles.spinner}></div> Menghitung Metrik...</>
                ) : (
                  '🚀 Jalankan Evaluasi Delegasi'
                )}
              </button>
            </div>
            
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
          <h2 className={styles.cardTitle}>Hasil Analisis Beban Kerja</h2>
          
          {result ? (
            <div className={styles.resultArea}>
              <div className={`${styles.alert} ${styles.alertSuccess}`}>
                ✅ {result.message}
              </div>
              
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>User Teranalisis</div>
                  <div className={styles.statValue}>{result.data.length}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Davies-Bouldin Index</div>
                  <div className={styles.statValue}>{result.davies_bouldin_index}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Jumlah Cluster</div>
                  <div className={styles.statValue}>{result.cluster_summary.length}</div>
                </div>
              </div>

              <h3 className={styles.sectionTitle}>Peta Distribusi Beban Kerja</h3>
              <div className={styles.plotImage}>
                <img src={`${result.preview_url}?t=${new Date().getTime()}`} alt="User Clustering Result Plot" />
              </div>

              <h3 className={styles.sectionTitle}>Ringkasan Karakteristik Klaster</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Klaster</th>
                      <th>Rata-rata History Point</th>
                      <th>Jumlah Karyawan</th>
                      <th>Kategori Beban Kerja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.cluster_summary.map((c, i) => (
                      <tr key={i}>
                        <td><strong>#{c.cluster}</strong></td>
                        <td>{c.total_history_point_mean.toFixed(2)}</td>
                        <td>{c.employee_count}</td>
                        <td>
                          <span className={`${styles.badge} ${getInterpretationBadge(c.workload_category)}`}>
                            {c.workload_category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className={styles.sectionTitle}>Detail Beban Kerja Karyawan</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Assignee</th>
                      <th>Role (Type)</th>
                      <th>Total History Point</th>
                      <th>Klaster</th>
                      <th>Kategori</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((u, i) => (
                      <tr key={i}>
                        <td><strong>{u.assignee}</strong></td>
                        <td>{u.role}</td>
                        <td>{u.total_history_point}</td>
                        <td>#{u.cluster}</td>
                        <td>
                          <span className={`${styles.badge} ${getInterpretationBadge(u.workload_category)}`}>
                            {u.workload_category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Conclusion Section */}
              <div className={`${styles.card} ${styles.conclusionBox}`} style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)', border: '1px solid #bae6fd' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>💡 Rekomendasi Pemerataan Beban Kerja</h3>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <p>Berdasarkan hasil K-Means Clustering terhadap <strong>{result.data.length} karyawan</strong>, berikut adalah detail beban kerja:</p>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {result.cluster_summary.map((cs, idx) => {
                      const usersInCluster = result.data.filter(u => u.cluster === cs.cluster);
                      const userNames = usersInCluster.map(u => u.assignee).join(', ');
                      
                      if (cs.workload_category === 'Tinggi') {
                        return (
                          <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444' }}>
                            <strong>⚠️ Karyawan Beban Tinggi:</strong>
                            <p style={{ margin: '0.2rem 0' }}>User: <span style={{ color: '#b91c1c', fontWeight: 600 }}>{userNames}</span></p>
                            <p style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>Peringatan: Karyawan ini memikul beban tugas tertinggi. Diperlukan pemerataan tugas (delegasi ulang) untuk menghindari bottleneck.</p>
                          </div>
                        );
                      }
                      
                      if (cs.workload_category === 'Sedang') {
                        return (
                          <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '4px solid #f59e0b' }}>
                            <strong>⚖️ Karyawan Beban Sedang:</strong>
                            <p style={{ margin: '0.2rem 0' }}>User: <span style={{ color: '#92400e', fontWeight: 600 }}>{userNames}</span></p>
                            <p style={{ fontSize: '0.85rem', color: '#78350f' }}>Beban kerja karyawan ini relatif seimbang dan proporsional dengan kapasitas tim.</p>
                          </div>
                        );
                      }

                      if (cs.workload_category === 'Rendah') {
                        return (
                          <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '4px solid #10b981' }}>
                            <strong>🚀 Karyawan Beban Rendah:</strong>
                            <p style={{ margin: '0.2rem 0' }}>User: <span style={{ color: '#065f46', fontWeight: 600 }}>{userNames}</span></p>
                            <p style={{ fontSize: '0.85rem', color: '#064e3b' }}>Karyawan ini masih memiliki kapasitas beban yang minim. Sangat direkomendasikan untuk mendelegasikan tugas-tugas tambahan kepada karyawan ini.</p>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>

                  <div style={{ marginTop: '1.5rem', padding: '0.75rem', borderTop: '1px dashed var(--border)' }}>
                    <p>📊 <strong>Insight:</strong> Kualitas clustering ditunjukkan oleh nilai Davies-Bouldin Index (<strong>{result.davies_bouldin_index}</strong>), di mana nilai yang lebih kecil menunjukkan hasil pemisahan klaster yang lebih baik.</p>
                  </div>
                </div>
              </div>

              <div className={styles.actions} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <a 
                  href={result.excel_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className={styles.button}
                  style={{ background: '#10b981' }}
                >
                  📊 Download Laporan (Excel)
                </a>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <p>Belum ada data user yang diklaster.<br/>Silakan upload file CSV untuk melihat pembagian kelompok beban kerja tim.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
