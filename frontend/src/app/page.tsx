'use client';

import { useState, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    status: string;
    message: string;
    silhouette_score: number;
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

  const getInterpretationBadge = (interpretation: string) => {
    if (interpretation.includes('Overloaded') || interpretation.includes('Needs Improvement')) return styles.badgeDanger;
    if (interpretation.includes('Standard')) return styles.badgeWarning;
    if (interpretation.includes('High Performance')) return styles.badgeSuccess;
    if (interpretation.includes('Quality Issues')) return styles.badgeWarning;
    return styles.badgePrimary;
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Evaluasi Efektivitas Delegasi Tugas</h1>
        <p className={styles.description}>
          Analisis mendalam berdasarkan <strong>Velocity, Workload, Capacity, Quality</strong>, dan <strong>Delegation Efficiency</strong>.
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

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <button 
              className={styles.button}
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? (
                <><div className={styles.spinner}></div> Menghitung Metrik...</>
              ) : (
                '🚀 Jalankan Evaluasi Delegasi'
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
          <h2 className={styles.cardTitle}>Hasil Analisis Efektivitas Tim</h2>
          
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
                  <div className={styles.statLabel}>Silhouette Score</div>
                  <div className={styles.statValue}>{result.silhouette_score}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Kelompok Performa</div>
                  <div className={styles.statValue}>{result.cluster_summary.length}</div>
                </div>
              </div>

              <h3 className={styles.sectionTitle}>Peta Efektivitas Delegasi</h3>
              <div className={styles.plotImage}>
                <img src={`${result.preview_url}?t=${new Date().getTime()}`} alt="User Clustering Result Plot" />
              </div>

              <h3 className={styles.sectionTitle}>Ringkasan Karakteristik Klaster (Metrik Agregat)</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Klaster</th>
                      <th>Velocity</th>
                      <th>Workload</th>
                      <th>Capacity</th>
                      <th>Quality</th>
                      <th>Efficiency Index</th>
                      <th>Interpretasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.cluster_summary.map((c, i) => (
                      <tr key={i}>
                        <td><strong>#{c.cluster}</strong></td>
                        <td>{(c.velocity_achievement * 100).toFixed(1)}%</td>
                        <td>{c.workload_score}</td>
                        <td>{(c.capacity_ratio * 100).toFixed(1)}%</td>
                        <td>{(c.quality_factor * 100).toFixed(1)}%</td>
                        <td><strong>{c.delegation_efficiency_index}</strong></td>
                        <td>
                          <span className={`${styles.badge} ${getInterpretationBadge(c.interpretation)}`}>
                            {c.interpretation}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className={styles.sectionTitle}>Detail Performa per Assignee</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Assignee</th>
                      <th>Role</th>
                      <th>Velocity</th>
                      <th>Workload</th>
                      <th>Quality</th>
                      <th>Eff. Index</th>
                      <th>Klaster</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((u, i) => (
                      <tr key={i}>
                        <td><strong>{u.assignee}</strong></td>
                        <td>{u.role}</td>
                        <td>{(u.velocity_achievement * 100).toFixed(1)}%</td>
                        <td>{u.workload_score}</td>
                        <td>{(u.quality_factor * 100).toFixed(1)}%</td>
                        <td><strong>{u.delegation_efficiency_index}</strong></td>
                        <td>
                          <span className={`${styles.badge} ${getInterpretationBadge(result.cluster_summary.find(cs => cs.cluster === u.cluster)?.interpretation || '')}`}>
                            #{u.cluster}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Conclusion Section */}
              <div className={`${styles.card} ${styles.conclusionBox}`} style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)', border: '1px solid #bae6fd' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>💡 Kesimpulan & Rekomendasi Manajemen</h3>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <p>Berdasarkan analisis klastering terhadap <strong>{result.data.length} anggota tim</strong>, berikut adalah detail pembagian beban kerjanya:</p>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {result.cluster_summary.map((cs, idx) => {
                      const usersInCluster = result.data.filter(u => u.cluster === cs.cluster);
                      const userNames = usersInCluster.map(u => u.assignee).join(', ');
                      
                      if (cs.interpretation.includes('High Performance')) {
                        return (
                          <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '4px solid #10b981' }}>
                            <strong>🚀 Kelompok High Performance:</strong>
                            <p style={{ margin: '0.2rem 0' }}>User: <span style={{ color: '#065f46', fontWeight: 600 }}>{userNames}</span></p>
                            <p style={{ fontSize: '0.85rem', color: '#064e3b' }}>Kelompok ini memiliki indeks efisiensi dan kualitas terbaik. Sangat handal untuk tugas-tugas kritikal.</p>
                          </div>
                        );
                      }
                      
                      if (cs.interpretation.includes('Standard')) {
                        return (
                          <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '4px solid #f59e0b' }}>
                            <strong>⚖️ Kelompok Standard Performance:</strong>
                            <p style={{ margin: '0.2rem 0' }}>User: <span style={{ color: '#92400e', fontWeight: 600 }}>{userNames}</span></p>
                            <p style={{ fontSize: '0.85rem', color: '#78350f' }}>Beban kerja dan kualitas berada di level rata-rata tim. Performa sudah stabil.</p>
                          </div>
                        );
                      }

                      if (cs.interpretation.includes('Needs Improvement') || cs.interpretation.includes('Overloaded')) {
                        return (
                          <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444' }}>
                            <strong>⚠️ Kelompok Needs Improvement / Overloaded:</strong>
                            <p style={{ margin: '0.2rem 0' }}>User: <span style={{ color: '#b91c1c', fontWeight: 600 }}>{userNames}</span></p>
                            <p style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>{cs.interpretation.includes('Overloaded') ? 'Peringatan: Kapasitas terlampaui!' : 'Perlu perhatian khusus pada kualitas hasil kerja atau distribusi beban.'}</p>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>

                  <div style={{ marginTop: '1.5rem', padding: '0.75rem', borderTop: '1px dashed var(--border)' }}>
                    <p>📊 <strong>Insight Utama:</strong> Total beban Story Point tertinggi dipikul oleh <strong>{
                      (() => {
                        const top = [...result.data].sort((a, b) => b.story_point - a.story_point)[0];
                        return top ? `${top.assignee} (${top.story_point} SP)` : '-';
                      })()
                    }</strong>.</p>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <a 
                  href={result.download_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className={styles.button}
                >
                  📥 Download Laporan User (HD)
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
