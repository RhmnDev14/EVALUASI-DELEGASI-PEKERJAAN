# Pengelompokan Beban Kerja Karyawan Menggunakan Metode K-Means Clustering pada PT PLN Icon Plus

Proyek ini merupakan implementasi algoritma **K-Means Clustering** yang digunakan untuk mendukung penelitian skripsi dengan judul **"Pengelompokan Beban Kerja Karyawan Menggunakan Metode K-Means Clustering pada PT PLN Icon Plus"**. Sistem ini bertujuan untuk mengelompokkan karyawan divisi DGE berdasarkan beban kerja secara objektif untuk evaluasi pemerataan tugas.

## 📌 Deskripsi Proyek

Penelitian ini menerapkan algoritma K-Means Clustering untuk mengelompokkan karyawan berdasarkan agregasi bobot kerjanya, lalu mengevaluasi distribusi beban kerja tersebut pada tiap penerima tugas secara objektif. Pengelompokan K-Means secara matematis murni menggunakan 1 dimensi, yaitu akumulasi bobot pekerjaan (total history point / story point) per karyawan, sementara atribut tipe pekerjaan (role) dipertahankan sebagai atribut kontekstual untuk analisis pasca-klastering.

## 🏗️ Arsitektur Proses

Berikut adalah alur data algoritma dari dataset mentah hingga tahap evaluasi akhir:
1. **Data Task**: Penarikan dataset penugasan yang mencakup *Assignee*, *Role*, dan *Story Point*.
2. **Aggregation**: Pengelompokan (Group By) berdasarkan *Assignee*, lalu dilakukan penjumlahan (Sum) seluruh *Story Point* menjadi variabel `total_history_point`.
3. **Standardization**: Normalisasi distribusi `total_history_point` menggunakan `StandardScaler`.
4. **K-Means Clustering**: Menjalankan algoritma K-Means dengan batas `K=3` (Rendah, Sedang, Tinggi) pada matriks fitur 1-dimensi.
5. **Centroid-based Labeling**: Melakukan pengurutan (*sorting*) nilai centroid dari yang terkecil ke terbesar untuk menetapkan pemetaan kategori beban kerja secara otomatis dan anti-bias.
6. **Evaluation**: Menghitung kualitas dan kepadatan pemisahan klaster menggunakan metrik *Davies-Bouldin Index (DBI)*.
7. **Contextual Analysis**: Menabulasikan silang hasil klastering dengan parameter *Role* untuk evaluasi sebaran beban kerja antar departemen.

## 🚀 Fitur Utama

- **REST API (FastAPI)**: Memungkinkan integrasi dengan aplikasi lain (Web/Mobile).
- **Analisis K-Means**: Pengelompokan beban kerja karyawan menggunakan K=3 (Rendah, Sedang, Tinggi).
- **Validasi Cepat (Dry Run)**: Fitur untuk memvalidasi format dan kelengkapan data sebelum diproses secara penuh.
- **Visualisasi Premium (Seaborn)**: Grafik distribusi beban per _assignee_ dengan resolusi tinggi.
- **Evaluasi Klaster**: Penghitungan kualitas klaster menggunakan **Davies-Bouldin Index (DBI)**.
- **Manajemen Template**: Endpoint untuk mengunduh template CSV standar.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Backend**: Python 3.x, FastAPI, Uvicorn
- **Data Science**: Pandas, Scikit-Learn
- **Visualisasi**: Matplotlib, Seaborn

## 📋 Prasyarat

Pastikan Anda sudah menginstal Python (Backend) dan Node.js (Frontend) di sistem Anda.

### Setup Lingkungan Python (Backend)

Sangat disarankan menggunakan _virtual environment_ (`venv`) agar dependensi tidak bentrok:

```bash
cd backend
python3 -m venv venv  # Gunakan python3 untuk Mac/Linux, atau python untuk Windows

# Aktivasi venv (Mac/Linux):
source venv/bin/activate
# Aktivasi venv (Windows):
# venv\Scripts\activate

pip install -r requirements.txt
```

## 📂 Format Dataset

Dataset `.csv` harus memiliki kolom-kolom berikut agar dapat diproses oleh sistem:
- `sprint_id` (String)
- `role` (String)
- `assignee` (String)
- `story_point` (Numeric)
- `complexity_score` (Numeric)
- `risk_score` (Numeric)
- `dependency_score` (Numeric)
- `uncertainty_score` (Numeric)
- `volume_score` (Numeric)
- `task_duration_hours` (Numeric)
- `reopen_count` (Numeric)
- `role_capacity` (Numeric)

---

## 💻 Cara Penggunaan

### A. Cara Cepat dengan 1 Perintah (Sangat Disarankan)

Anda bisa menyiapkan dependensi dan menjalankan **Backend** dan **Frontend** secara bersamaan hanya dengan 1 perintah melalui terminal di folder utama proyek:

```bash
./run.sh
```

**Script ini akan secara otomatis:**
- Membuat dan mengaktifkan _virtual environment_ (jika belum ada).
- Menginstal semua pustaka (_library_) yang dibutuhkan (backend & frontend).
- Membuka browser web Anda secara otomatis ke `http://localhost:3000`.

*(Server backend akan berjalan di background dan frontend di foreground. Untuk mematikan keduanya, cukup tekan `CTRL+C` di terminal tersebut.)*

### B. Penggunaan Manual Web Frontend

Jika Anda lebih suka menjalankan secara manual di terminal terpisah:

1. **Jalankan API Server** (Terminal 1):
   ```bash
   cd backend
   # Pastikan environment (venv) sudah aktif!
   # Jika error "command not found: python" di Mac/Linux, gunakan python3:
   python main.py --api  # atau python3 main.py --api
   ```
2. **Jalankan Frontend Server** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
3. **Akses Aplikasi**: Buka browser dan kunjungi `http://localhost:3000`.

### B. Penggunaan API Server

1. **Jalankan Server**:
   ```bash
   cd backend
   # Pastikan environment (venv) sudah aktif!
   # Jika error "command not found: python" di Mac/Linux, gunakan python3:
   python main.py --api  # atau python3 main.py --api
   ```
2. **Dokumentasi Interaktif**: Buka `http://127.0.0.1:8000/`. Anda akan diarahkan ke **Swagger UI**.
3. **Alur Kerja**:
   - `GET /template` untuk mendapatkan contoh file.
   - `POST /dry-run` untuk memvalidasi data CSV tanpa menjalankan clustering.
   - `POST /upload` untuk memproses data dan menjalankan K-Means.
   - `GET /preview` untuk melihat visualisasi hasil terbaru.
   - `GET /download` untuk mengunduh laporan grafik resolusi tinggi.

### C. Penggunaan Lokal (CLI)

1. Letakkan dataset di folder `backend/assets/`.
2. Jalankan:
   ```bash
   cd backend
   # Pastikan environment (venv) sudah aktif!
   # Jika error "command not found: python" di Mac/Linux, gunakan python3:
   python main.py  # atau python3 main.py
   ```

---

## 📊 Penjelasan Output

### 1. Visualisasi Grafik (`/preview` atau Web)

Grafik menyajikan analisis yang mendalam mengenai distribusi beban kerja:

- **Sumbu X**: Menampilkan nama **Assignee** (Penerima Tugas).
- **Sumbu Y**: Menampilkan **Total History Point** (Total Beban Kerja).
- **Panel Ringkasan (Kanan)**: Menampilkan total tugas, **Davies-Bouldin Index**, dan jumlah karyawan dengan beban tinggi.
- **Kategori Klaster / Interpretasi**:
  - **Karyawan Beban Rendah**: Kapasitas beban kerja minim, direkomendasikan untuk menerima delegasi tugas tambahan.
  - **Karyawan Beban Sedang**: Beban kerja seimbang dan proporsional.
  - **Karyawan Beban Tinggi**: Memikul beban tertinggi. Diperlukan pemerataan (delegasi ulang) untuk menghindari bottleneck.

### 2. Hasil Ekspor Data

Data hasil clustering tetap disimpan di `results/hasil_evaluasi_delegasi.csv` dengan kolom tambahan parameter agregasi total history point dan informasi `workload_category` (Rendah/Sedang/Tinggi).

## 🎯 Manfaat untuk Evaluasi Delegasi

1. **Workload Balancing**: Mendeteksi ketimpangan beban kerja antar staf secara visual.
2. **Pengambilan Keputusan**: Memberikan dasar ilmiah (data-driven) bagi manajer untuk memindahkan tugas dari staf yang overload.
3. **Rekomendasi Strategis**: Membantu menentukan staf mana yang masih memiliki kapasitas untuk menerima tugas baru.

## 📂 Struktur Folder

```text
K-MEANS-CLUSTERING/
├── backend/            # API Server (Python/FastAPI)
│   ├── assets/         # Dataset input
│   ├── results/        # Export CSV & Grafik (.png)
│   ├── main.py         # Logika K-Means
│   └── requirements.txt
├── frontend/           # Aplikasi Web (Next.js)
└── README.md           # Dokumentasi Utama
```

## ✍️ Penulis

- **Judul Skripsi**: Pengelompokan Beban Kerja Karyawan Menggunakan Metode K-Means Clustering pada PT PLN Icon Plus
- **Instansi**: Universitas Indraprasta PGRI Jakarta

---

_Proyek ini dikembangkan untuk tujuan akademis dan penelitian._
