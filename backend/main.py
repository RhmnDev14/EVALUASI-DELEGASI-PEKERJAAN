import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
import os
import io
from fastapi import FastAPI, Response, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import argparse

app = FastAPI(title="API Evaluasi Delegasi Pekerjaan")

# Konfigurasi CORS agar bisa diakses oleh frontend (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Mengizinkan semua origin (untuk development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
async def root():
    """Redirect ke halaman dokumentasi Swagger"""
    return RedirectResponse(url="/docs")

def perform_clustering(df, k=3):
    """Fungsi inti untuk melakukan K-Means Clustering dengan Validasi Ketat"""
    # 1. Validasi Kelengkapan Kolom
    required_cols = ['task_id', 'title', 'type', 'status', 'assignee', 'history_point']
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"File tidak lengkap! Kolom berikut tidak ditemukan: {', '.join(missing_cols)}")

    # 2. Validasi Data Kosong
    if df.empty:
        raise ValueError("File CSV kosong atau tidak memiliki data.")
    
    # 3. Validasi Tipe Data history_point (Harus Numerik)
    df['history_point'] = pd.to_numeric(df['history_point'], errors='coerce')
    if df['history_point'].isnull().any():
        raise ValueError("Kolom 'history_point' harus berisi angka dan tidak boleh kosong.")

    # 4. Pembersihan Data (Drop baris yang memiliki nilai NaN pada kolom kunci)
    df = df.dropna(subset=['type', 'history_point', 'assignee'])

    # Preprocessing
    le_type = LabelEncoder()
    df['type_encoded'] = le_type.fit_transform(df['type'].astype(str))
    
    features_list = ['history_point', 'type_encoded']
    X = df[features_list]
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # K-Means
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(X_scaled)
    
    return df, le_type

def generate_preview(df_result, le_type, output_path='results/latest_preview.png'):
    """Fungsi untuk membuat dan menyimpan grafik clustering yang lebih user-friendly"""
    sns.set_theme(style="whitegrid")
    plt.figure(figsize=(14, 8))
    
    # Hitung rata-rata tiap klaster untuk penjelasan otomatis
    cluster_counts = df_result['cluster'].value_counts()
    cluster_means = df_result.groupby('cluster')['history_point'].mean().sort_values()
    cluster_labels = {}
    rank_names = ["Beban Rendah", "Beban Sedang", "Beban Tinggi"]
    for i, (cluster_id, mean_val) in enumerate(cluster_means.items()):
        cluster_labels[cluster_id] = rank_names[i]

    # Hitung ringkasan analisis untuk delegasi
    top_assignee = df_result.groupby('assignee')['history_point'].sum().idxmax()
    total_tasks = len(df_result)
    heavy_cluster_id = cluster_means.index[-1]
    heavy_task_count = cluster_counts.get(heavy_cluster_id, 0)

    # Tambahkan jitter
    jitter = np.random.uniform(-0.2, 0.2, size=len(df_result))
    
    # Buat scatter plot
    preview = sns.scatterplot(
        x=df_result['assignee'],
        y=df_result['history_point'],
        hue=df_result['cluster'],
        palette='viridis',
        s=160,
        alpha=0.8,
        edgecolor='black',
        linewidth=0.5,
        legend='full'
    )
    
    # Perbarui teks legend agar lebih informatif
    handles, labels = preview.get_legend_handles_labels()
    new_labels = []
    for l in labels:
        cid = int(l)
        avg = df_result[df_result['cluster'] == cid]['history_point'].mean()
        new_labels.append(f"Cluster {l}: {cluster_labels[cid]} (Avg HP: {avg:.1f})")
    plt.legend(handles, new_labels, title='Kategori Beban Kerja', bbox_to_anchor=(1.02, 1), loc='upper left')
    
    plt.title('Evaluasi Delegasi Pekerjaan: Distribusi Beban per Assignee', fontsize=18, pad=20, fontweight='bold')
    plt.xlabel('Nama Assignee (Penerima Tugas)', fontsize=13)
    plt.ylabel('History Points (Bobot Kerja)', fontsize=13)
    
    # Tambahkan Ringkasan Analisis di sisi kanan bawah
    summary_text = (
        "📊 Ringkasan Analisis:\n"
        f"• Total Tugas: {total_tasks}\n"
        f"• Beban Terberat: {top_assignee}\n"
        f"• Tugas Beban Tinggi: {heavy_task_count} item\n"
        "-----------------------------------\n"
        "💡 Rekomendasi:\n"
        f"Perhatikan beban kerja {top_assignee}\n"
        "agar distribusi delegasi tetap ideal."
    )
    plt.text(1.02, 0.2, summary_text, transform=plt.gca().transAxes, fontsize=11, 
             verticalalignment='bottom', bbox={'boxstyle':'round', 'facecolor':'white', 'alpha':0.9, 'edgecolor':'gray'})

    # Tambahkan penjelasan teks di bawah grafik
    explanation = (
        "ℹ️ Keterangan: Sumbu X adalah Penerima Tugas, Sumbu Y adalah Bobot Tugas, dan Warna menunjukkan Cluster."
    )
    plt.figtext(0.1, 0.02, explanation, fontsize=10, style='italic', alpha=0.7)
    
    plt.tight_layout(rect=[0, 0.05, 0.85, 1]) # Sisakan ruang di kanan untuk legend dan summary
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=300)
    plt.close()

@app.get("/template")
async def get_template():
    """Endpoint untuk mengambil template file CSV"""
    template_data = {
        'task_id': ['AP-001', 'AP-002'],
        'title': ['Contoh Tugas 1', 'Contoh Tugas 2'],
        'type': ['BE', 'FE'],
        'status': ['TO DO', 'DONE'],
        'assignee': ['Budi', 'Siti'],
        'history_point': [5, 3]
    }
    df_template = pd.DataFrame(template_data)
    
    # Simpan ke buffer
    stream = io.StringIO()
    df_template.to_csv(stream, index=False)
    
    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=template_delegasi.csv"}
    )

@app.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    """Endpoint untuk upload CSV, mendapatkan hasil JSON, dan URL grafik"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Hanya file CSV yang diperbolehkan.")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Jalankan clustering
        df_result, le_type = perform_clustering(df)
        
        # Generate plot
        preview_path = 'results/latest_preview.png'
        generate_preview(df_result, le_type, preview_path)
        
        # Bangun URL untuk grafik
        base_url = str(request.base_url)
        preview_url = f"{base_url}preview"
        download_url = f"{base_url}download"
        
        # Kembalikan hasil
        return {
            "status": "success",
            "message": "File berhasil diproses dan diklusterkan",
            "preview_url": preview_url,
            "download_url": download_url,
            "data": df_result.to_dict(orient="records")
        }
        
    except ValueError as ve:
        # Error validasi dari perform_clustering (Kolom hilang, data bukan angka, dll)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Error server lainnya
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan server: {str(e)}")

@app.get("/preview")
async def get_preview():
    """Endpoint untuk melihat hasil grafik terbaru di browser"""
    preview_path = 'results/latest_preview.png'
    if not os.path.exists(preview_path):
        raise HTTPException(status_code=404, detail="Grafik belum tersedia. Silakan upload file terlebih dahulu.")
    return FileResponse(preview_path)

@app.get("/download")
async def download_preview():
    """Endpoint untuk mengunduh hasil grafik terbaru"""
    preview_path = 'results/latest_preview.png'
    if not os.path.exists(preview_path):
        raise HTTPException(status_code=404, detail="File tidak ditemukan.")
    return FileResponse(
        path=preview_path, 
        filename="hasil_analisis_delegasi.png",
        media_type="image/png"
    )

def run_local():
    print("=== Sistem Evaluasi Delegasi Pekerjaan (K-Means) ===")
    file_path = 'assets/ioffice_dataset_typed_titles_150.csv'
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} tidak ditemukan!")
        return

    df = pd.read_csv(file_path)
    df_result, le_type = perform_clustering(df)
    
    print("\nAnalisis Rata-rata per Klaster:")
    print(df_result.groupby('cluster')[['history_point', 'type_encoded']].mean())

    # Visualisasi
    plt.figure(figsize=(10, 6))
    jitter = np.random.uniform(-0.15, 0.15, size=len(df_result))
    scatter = plt.scatter(df_result['type_encoded'] + jitter, 
                         df_result['history_point'], 
                         c=df_result['cluster'], 
                         cmap='viridis', alpha=0.6, s=80)
    
    plt.title('Klastering Evaluasi Delegasi Pekerjaan')
    plt.xticks(ticks=range(len(le_type.classes_)), labels=le_type.classes_)
    plt.colorbar(scatter, label='Cluster ID')
    plt.show()

    output_path = 'results/hasil_clustering_delegasi.csv'
    os.makedirs('results', exist_ok=True)
    df_result.to_csv(output_path, index=False)
    print(f"\nHasil disimpan ke: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="K-Means Job Delegation")
    parser.add_argument("--api", action="store_true", help="Jalankan sebagai API Server")
    args = parser.parse_args()

    if args.api:
        print("Memulai API Server di http://127.0.0.1:8000")
        print("Coba endpoint: http://127.0.0.1:8000/template")
        uvicorn.run(app, host="127.0.0.1", port=8000)
    else:
        run_local()
